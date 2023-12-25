import { AnimationClip, LoopOnce, Vector3 } from "three"
import { createTrackInterpolant } from "./MMDLoader"
import { cameraToClips } from "./cameraClipsBuilder"


export const CameraMode = {
    MOTION_FILE: 0,
    COMPOSITION: 1,
    FIXED_FOLLOW: 2
}
export class MMDCameraWorkHelper {
    constructor() {
        // Scrolling bar
        this._scrollingBar = document.querySelector(".scrolling-bar")
        this._scrollingDuration = 3.0  // seconds

        // Clips is a array of clipInfo for composition camera mode
        this._compositeClips = []
        // target clips reference above clips that currently running
        // default to motion file clips
        this._compositeClips = this._compositeClips

        // add buffer beats
        this._beatsBuffer = [...Array(30)].map(_ => {
            const beatEl = document.createElement("div")
            beatEl.className = "cut"
            beatEl.style.display = "none"
            this._scrollingBar.appendChild(beatEl)
            return beatEl
        })

        // Keybindings
        this._cutClipMap = {}
    }

    async init(mmd) {
        // Internal properties
        this._mmd = mmd
        this._camera = mmd.camera
        const cameraObj = mmd.helper.get(mmd.camera)
        this._origAction = cameraObj.actions[0]
        this._cameraMixer = cameraObj.mixer
        this._api = mmd.api
        this._currentCollection = mmd.api.collectionKeys[0]
        this._currentClip = null

        // Fixed Follow
        this._prevCenterPos = this._smoothCenter.clone()
        this._mmd.controls.target = this._smoothCenter.clone()
        this._deltaBuffer = new Vector3()
        this.isOrbitControl = false

        this._loadCompositeClips()

        document.addEventListener("keydown", (e) => {
            // not trigger on default keyboard shortcuts
            // e.preventDefault()
            if (e.ctrlKey || e.metaKey || !this.isComposite) {
                return
            }
            const pressedKeyBinding = this._currentCollection + e.key
            if (this._api.collectionKeys.includes(e.key)) {
                this._currentCollection = e.key
                // composite mode 
            } else if (pressedKeyBinding in this._cutClipMap) {

                // if we have another beat(pressed ArrowLeft), clear it
                this._clearCurrentBeat()

                const clipInfoCopy = { ...this._cutClipMap[pressedKeyBinding] }
                clipInfoCopy.cutTime = this._currentTime

                this._compositeClips.push(clipInfoCopy)
                this._saveCompositeClips()
                this.setTime(this._currentTime)

            } else if (e.key == "ArrowLeft") {
                let minDiff = null
                let prevClip = null
                for (const clip of this._compositeClips) {
                    const diff = Math.round((this._currentTime - clip.cutTime) * 1000)
                    if (diff > 0) {
                        if (minDiff == null || diff < minDiff) {
                            minDiff = diff
                            prevClip = clip
                        }
                    }
                }
                if (prevClip != null) {
                    prevClip.action.reset()
                    player.currentTime = prevClip.cutTime - (this._api.motionOffset * 0.001)
                }
            } else if (e.key == "ArrowRight") {
                let minDiff = null
                let nextCutTime = null
                for (const { cutTime } of this._compositeClips) {
                    const diff = Math.round((cutTime - this._currentTime) * 1000)
                    if (diff > 0) {
                        if (minDiff == null || diff < minDiff) {
                            minDiff = diff
                            nextCutTime = cutTime
                        }
                    }
                }
                if (nextCutTime != null) {
                    player.currentTime = nextCutTime - (this._api.motionOffset * 0.001)
                }
            } else if (["Delete", "Backspace"].includes(e.key)) {
                this._clearCurrentBeat()
                this._saveCompositeClips()
                this.setTime(this._currentTime)
            }
        })

        // if dont have clips, create them from motion file
        if(this._compositeClips.length == 0) {
            const resp = await fetch(this._api.cameraFile)
            const { cutTimes, clips: rawClips } = cameraToClips(await resp.arrayBuffer())
    
            for (const [idx, cutTime] of cutTimes.entries()) {
                const rawClip = rawClips[idx]
                const clip = AnimationClip.parse(rawClip.clip)
                this._restoreInterpolant(clip, rawClip.interpolations)
    
                // add scrolling bar beat key binding
                const collectionKey = this._api.collectionKeys[Math.floor(idx / this._api.cutKeys.length)]
                const cutKey = this._api.cutKeys[idx % this._api.cutKeys.length]
                const keyBinding = collectionKey + cutKey
                const action = this._createAction(clip)
    
                const clipInfo = {
                    action,
                    cutTime,
                    keyBinding,
                    interpolations: rawClip.interpolations
                }
                this._compositeClips.push(clipInfo)
                this._cutClipMap[keyBinding] = clipInfo
            }
        }

        this.checkCameraMode()
    }

    get _currentTime() {
        return this._mmd.motionTime
    }

    get isMotionFile() {
        return this._api["camera mode"] == CameraMode.MOTION_FILE
    }

    get isComposite() {
        return this._api["camera mode"] == CameraMode.COMPOSITION
    }

    get isFixedFollow() {
        return this._api["camera mode"] == CameraMode.FIXED_FOLLOW
    }

    get _smoothCenter() {
        return this._mmd.character.getObjectByName("smoothCenter").position
    }

    _clearCurrentBeat() {
        if (this._currentClip) {
            const diff = player.currentTime - (this._currentClip.cutTime - (this._api.motionOffset * 0.001))
            if (Math.round(diff * 1000) == 0) {
                this._currentClip.action.stop()
                const idx = this._compositeClips.indexOf(this._currentClip)
                this._compositeClips.splice(idx, 1)
            }
        }
    }
    async _saveCompositeClips() {
        const json = []
        for (const clip of this._compositeClips) {
            const saveClip = { ...clip }
            delete saveClip.action
            saveClip.clipJson = AnimationClip.toJSON(clip.action.getClip())
            json.push(saveClip)
        }
        this._api.compositeClips = json
    }

    async _loadCompositeClips() {
        if (this._api.compositeClips) {
            for (const saveClip of this._api.compositeClips) {
                const clipInfo = { ...saveClip }
                delete clipInfo.clipJson

                const clip = AnimationClip.parse(saveClip.clipJson)
                if(!clipInfo.interpolations){
                    this._api.compositeClips = []
                    setTimeout(()=>location.reload(), 5000)
                }
                this._restoreInterpolant(clip, clipInfo.interpolations)
                clipInfo.action = this._createAction(clip)

                this._compositeClips.push(clipInfo)
                this._cutClipMap[clipInfo.keyBinding] = clipInfo
            }
        }
    }

    _createAction(clip) {
        const action = this._cameraMixer.clipAction(clip)
        action.setLoop(LoopOnce)
        action.clampWhenFinished = true
        return action
    }

    _resetAllBeats() {
        for (const beatEl of this._beatsBuffer) {
            beatEl.style.display = "none";
        }
    }

    checkCameraMode() {
        this._scrollingBar.style.display = this.isComposite ? "block" : "none"
        this._origAction.enabled = this.isMotionFile
        if (this.isMotionFile) {
            if (this._currentClip?.action.isRunning()) {
                this._currentClip.action.stop()
            }
            this._mmd.controls.target = this._camera.getObjectByName("target").position;
        } else if (this.isFixedFollow) {
            this._mmd.controls.target = this._smoothCenter.clone();
        }
        this.setTime(this._currentTime)
    }

    _restoreInterpolant(clip, interpolations) {
        for (const track of clip.tracks) {
            createTrackInterpolant(track, interpolations[track.name], true)
        }
    }

    _playComposite() {

        let minDiff = null
        let targetClip = null
        for (const clip of this._compositeClips) {
            // round to fix cutTime precision problem
            const diff = Math.round((this._currentTime - clip.cutTime) * 1000)
            if (diff >= 0) {
                if (minDiff == null || diff < minDiff) {
                    minDiff = diff
                    targetClip = clip
                }
            }
        }

        if (targetClip && targetClip != this._currentClip) {
            if (this._currentClip) {
                this._currentClip.action.stop()
            };
            this._currentClip = targetClip
            targetClip.action.play();
        }

    }

    setTime(time) {

        const isComposite = this.isComposite
        if (isComposite) {
            this._playComposite()
        }
        const onCustom = this._currentClip?.action.isRunning() && isComposite
        const isOrig = this._origAction.isRunning()
        if (isOrig) {
            this._cameraMixer.setTime(time)
        } else if (onCustom) {
            // condition to fix cutTime precision problem that cause action be disabled
            const targetTime = (time - this._currentClip.cutTime) < 0 ? 0 : (time - this._currentClip.cutTime)
            this._cameraMixer.setTime(targetTime)
        }
        if (isOrig || onCustom) {
            this._camera.up.set(0, 1, 0);
            this._camera.up.applyQuaternion(this._camera.quaternion);
            this._camera.lookAt(this._camera.getObjectByName("target").position);
            this._camera.updateProjectionMatrix();
        } else if(this.isFixedFollow) {
            const position = this._smoothCenter
            const delta = this._deltaBuffer.subVectors(position, this._prevCenterPos)
            this._prevCenterPos.copy(position)
            
            this._mmd.controls.target.add(delta)
            
            if(!this.isOrbitControl) {
                this._camera.lookAt(this._mmd.controls.target);
                this._camera.position.add(delta)
                this._camera.updateProjectionMatrix();
            }
        }

        if (isComposite) {
            this._updateScrollingBar()
        }
    }

    _updateScrollingBar() {
        this._resetAllBeats()
        let beatsBufferIdx = 0;
        for (const { cutTime, keyBinding } of this._compositeClips) {

            if (this._currentTime <= cutTime && cutTime <= this._currentTime + this._scrollingDuration) {
                const beatEl = this._beatsBuffer[beatsBufferIdx]
                beatsBufferIdx++
                const timeDiff = cutTime - this._currentTime
                beatEl.style.left = `${100 * (timeDiff / this._scrollingDuration)}%`;
                beatEl.style.display = "block";
                beatEl.textContent = keyBinding.toUpperCase()

                if (timeDiff < 0.1) {
                    beatEl.classList.add("goal")
                } else {
                    beatEl.classList.remove("goal")
                }
            }
        }
    }

    updateKeyBinding() {
        // clear cutActionMap
        for (const key in this._cutClipMap) {
            delete this._cutClipMap[key]
        }
        // binding AnimationActions with keyboard shortcuts and update scrolling bar
        for (const [idx, clipInfo] of this._compositeClips.entries()) {
            // update keybindings
            const modeKey = this._api.collectionKeys[Math.floor(idx / this._api.cutKeys.length)]
            const cutKey = this._api.cutKeys[idx % this._api.cutKeys.length]
            const keyBinding = modeKey + cutKey
            clipInfo.keyBinding = keyBinding
            this._cutClipMap[keyBinding] = clipInfo
        }
    }
}
