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
        this._scrollingDuration = 3.0

        // Clips is a array of clipInfo for each camera mode
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
        this._currentCollection = "1"
        this._currentAction = null
        this._cutOffset = 0

        document.addEventListener("keydown", (e) => {
            const pressedKeyBinding = this._currentCollection + e.key
            if (this._api.collectionKeys.includes(e.key)) {
                this._currentCollection = e.key
                // create a new beat and play it
            } else if (pressedKeyBinding in this._cutClipMap) {
                if (!this.isCreative) {
                    return
                }

                // stop previous action
                if (this._currentAction) {
                    this._currentAction.stop()
                }
                this._cutOffset = this._mmd.motionTime;

                const clipInfoCopy = { ...this._cutClipMap[pressedKeyBinding] }
                clipInfoCopy.cutTime = this._cutOffset
                clipInfoCopy.action.play()

                this._creativeClips.push(clipInfoCopy)
                this._currentAction = clipInfoCopy.action

            } else if (e.key == "ArrowLeft") {
                let minDiff = null
                let prevCutTime = null
                for (const { cutTime } of this._targetClips) {
                    const diff = Math.round((this._mmd.motionTime - cutTime) * 100)
                    if (diff > 0) {
                        if (minDiff == null || diff < minDiff) {
                            minDiff = diff
                            prevCutTime = cutTime
                        }
                    }
                }
                if (prevCutTime != null) {
                    player.currentTime = prevCutTime - (this._api.motionOffset * 0.001)
                }
            } else if (e.key == "ArrowRight") {
                let minDiff = null
                let nextCutTime = null
                for (const { cutTime } of this._targetClips) {
                    const diff = Math.round((cutTime - this._mmd.motionTime) * 100)
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

        this._currentAction = null
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
            if (this._currentAction?.isRunning()) {
                this._currentAction.stop()
            }
        }

        this._targetClips = this.isCreative ? this._creativeClips : this._motionClips
        this._updateScrollingBar(this._mmd.motionTime)
    }

    _playComposite(time) {

        let minDiff = null
        let targetAction = null
        let targetCutTime = null
        for (const { cutTime, action } of this._targetClips) {
            // round to fix cutTime precision problem
            const diff = Math.round(time * 1000) - Math.round(cutTime * 1000)
            if (diff >= 0) {
                if (minDiff == null || diff < minDiff) {
                    minDiff = diff
                    targetAction = action
                    targetCutTime = cutTime
                }
            }
        }

        if (targetAction != this._currentAction) {
            if (this._currentAction) {
                this._currentAction.stop()
            };
            this._cutOffset = targetCutTime;
            targetAction.play();
            this._currentAction = targetAction
        }

    }

    setTime(time) {
        if (this.isComposite) {
            this._playComposite(time)
        }
        const isCustom = this._currentAction?.isRunning() && !this.isMotionFile
        const isOrig = this._origAction.isRunning()
        if (isOrig) {
            this._cameraMixer.setTime(time)
        } else if (isCustom) {
            // condition to fix cutTime precision problem that cause action be disabled
            const frameTime = (time - this._cutOffset) < 0 ? 0 : (time - this._cutOffset)
            this._cameraMixer.setTime(frameTime)
        }
        if (isOrig || isCustom) {
            this._camera.up.set(0, 1, 0);
            this._camera.up.applyQuaternion(this._camera.quaternion);
            this._camera.lookAt(this._camera.getObjectByName("target").position);
            this._camera.updateProjectionMatrix();
        }

        if (!this.isMotionFile) {
            this._updateScrollingBar(time)
        }
    }

    _updateScrollingBar(time) {
        this._resetAllBeats()
        let beatsBufferIdx = 0;
        for (const { cutTime, keyBinding } of this._targetClips) {
            
            if (time <= cutTime && cutTime <= time + this._scrollingDuration) {
                const beatEl = this._beatsBuffer[beatsBufferIdx]
                beatsBufferIdx++
                const timeDiff = cutTime - time
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
