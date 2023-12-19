import { AnimationClip, LoopOnce } from "three"
import { createTrackInterpolant } from "./MMDLoader"
import { cameraToClips } from "./cameraClipsBuilder"


export const CameraMode = {
    MOTION_FILE: 0,
    COMPOSITION: 1,
    CREATIVE: 2
}
export class MMDCameraWorkHelper {
    constructor(mmd) {

        // Scrolling bar
        this._scrollingBar = document.querySelector(".scrolling-bar")
        this._scrollingDuration = 3.0  // seconds

        // Clips is a array of clipInfo for one camera mode
        this._motionClips = []
        this._creativeClips = []
        // target clips reference above clips that currently running
        // default to motion file clips
        this._targetClips = this._motionClips

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

        // Internal properties
        this._mmd = mmd
        const cameraObj = mmd.helper.get(mmd.camera)
        this._camera = cameraObj.camera
        this._api = mmd.api
        this._origAction = cameraObj.actions[0]
        this._cameraMixer = cameraObj.mixer
        this._currentCollection = mmd.api.collectionKeys[0]
        this._currentClip = null
        this._cutOffset = 0

        document.addEventListener("keydown", (e) => {
            const pressedKeyBinding = this._currentCollection + e.key
            if (this._api.collectionKeys.includes(e.key)) {
                this._currentCollection = e.key
            // creative mode 
            } else if (pressedKeyBinding in this._cutClipMap) {
                if (!this.isCreative) {
                    return
                }

                const clipInfoCopy = { ...this._cutClipMap[pressedKeyBinding] }
                clipInfoCopy.cutTime = this._currentTime

                this._creativeClips.push(clipInfoCopy)
                this.setTime(this._currentTime)

            } else if (e.key == "ArrowLeft") {
                let minDiff = null
                let prevClip = null
                for (const clip of this._targetClips) {
                    const diff = Math.round((this._currentTime - clip.cutTime) * 100)
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
                for (const { cutTime } of this._targetClips) {
                    const diff = Math.round((cutTime - this._currentTime) * 100)
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
            }
        })
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

    get isCreative() {
        return this._api["camera mode"] == CameraMode.CREATIVE
    }

    async init() {

        const resp = await fetch(this._api.cameraFile)
        const { cutTimes, clips } = cameraToClips(await resp.arrayBuffer())

        for (const [idx, cutTime] of cutTimes.entries()) {
            const rawClip = clips[idx]
            const clip = AnimationClip.parse(rawClip.clip)
            for (const track of clip.tracks) {
                createTrackInterpolant(track, rawClip.interpolations[track.name], true)
            }

            // add scrolling bar beat key binding
            const collectionKey = this._api.collectionKeys[Math.floor(idx / this._api.cutKeys.length)]
            const cutKey = this._api.cutKeys[idx % this._api.cutKeys.length]
            const keyBinding = collectionKey + cutKey
            const action = this._cameraMixer.clipAction(clip)
            action.setLoop(LoopOnce)
            action.clampWhenFinished = true

            const clipInfo = {
                action,
                cutTime,
                keyBinding
            }
            this._motionClips.push(clipInfo)
            this._cutClipMap[keyBinding] = clipInfo

        }

        this.checkCameraMode()
    }

    async updateMotionClips(cameraObj) {
        await this.init()

        this._currentClip = null
        this._origAction = cameraObj.actions[0]
        this._cameraMixer = cameraObj.mixer
    }

    _resetAllBeats() {
        for (const beatEl of this._beatsBuffer) {
            beatEl.style.display = "none";
        }
    }

    checkCameraMode() {
        this._scrollingBar.style.display = this.isMotionFile ? "none" : "block"
        this._origAction.enabled = this.isMotionFile
        if(this.isMotionFile) {
            if (this._currentClip?.action.isRunning()) {
                this._currentClip.action.stop()
            }
        }

        this._targetClips = this.isCreative ? this._creativeClips : this._motionClips
        this._updateScrollingBar()
    }

    _playComposite() {

        let minDiff = null
        let targetClip = null
        for (const clip of this._targetClips) {
            // round to fix cutTime precision problem
            const diff = Math.round(this._currentTime * 1000) - Math.round(clip.cutTime * 1000)
            if (diff >= 0) {
                if (minDiff == null || diff < minDiff) {
                    minDiff = diff
                    targetClip = clip
                }
            }
        }

        if (targetClip != this._currentClip) {
            if (this._currentClip) {
                this._currentClip.action.stop()
            };
            this._currentClip = targetClip
            targetClip.action.play();
        }

    }

    setTime(time) {

        const isCustom = this.isComposite || this.isCreative
        if (isCustom) {
            this._playComposite()
        }
        const onCustom = this._currentClip?.action.isRunning() && isCustom
        const isOrig = this._origAction.isRunning()
        if (isOrig) {
            this._cameraMixer.setTime(time)
        } else if (onCustom) {
            // condition to fix cutTime precision problem that cause action be disabled
            const targetTime = (time - this._currentClip.cutTime) < 0 ? 0 : (time - this._currentClip.cutTime)
            console.log(targetTime)
            this._cameraMixer.setTime(targetTime)
        }
        if (isOrig || onCustom) {
            this._camera.up.set(0, 1, 0);
            this._camera.up.applyQuaternion(this._camera.quaternion);
            this._camera.lookAt(this._camera.getObjectByName("target").position);
            this._camera.updateProjectionMatrix();
        }

        if (!this.isMotionFile) {
            this._updateScrollingBar()
        }
    }

    _updateScrollingBar() {
        this._resetAllBeats()
        let beatsBufferIdx = 0;
        for (const { cutTime, keyBinding } of this._targetClips) {
            
            if (this._currentTime <= cutTime && cutTime <= this._currentTime + this._scrollingDuration) {
                const beatEl = this._beatsBuffer[beatsBufferIdx]
                beatsBufferIdx++
                const timeDiff = cutTime - this._currentTime
                beatEl.style.left = `${100 * (timeDiff / this._scrollingDuration)}%`;
                beatEl.style.display = "block";
                beatEl.textContent = keyBinding.toUpperCase()

                if (timeDiff < 0.1) {
                    beatEl.style.backgroundColor = "#ffdd00"
                } else {
                    beatEl.style.backgroundColor = "aqua"
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
        for (const [idx, clipInfo] of this._targetClips.entries()) {
            // update keybindings
            const modeKey = this._api.collectionKeys[Math.floor(idx / this._api.cutKeys.length)]
            const cutKey = this._api.cutKeys[idx % this._api.cutKeys.length]
            const keyBinding = modeKey + cutKey
            clipInfo.keyBinding = keyBinding
            this._cutClipMap[keyBinding] = clipInfo
        }
    }
}
