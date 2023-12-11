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
        this._scrollingDuration = 3.0

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
            if (this._api.collectionKeys.includes(e.key)) {
                this._currentCollection = e.key
            } else if (this._api.cutKeys.includes(e.key)) {
                if (!this.isCreative) {
                    return
                }

                // stop previous action
                if (this._currentAction) {
                    this._currentAction.stop()
                }
                this._cutOffset = this._mmd.motionTime;
                if (!this._origAction.isRunning()) {
                    this._currentAction = this.cutActionMap[this._currentCollection + e.key]
                    this._currentAction.play()
                }
            } else if (e.key == "ArrowLeft") {
                let minDiff = null
                let prevCutTime = null
                for (const { cutTime } of this.cutClips) {
                    const diff = this._mmd.motionTime.toFixed(2) - cutTime.toFixed(2)
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
                for (const { cutTime } of this.cutClips) {
                    const diff = cutTime.toFixed(2) - this._mmd.motionTime.toFixed(2)
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
        const scrollingBar = document.querySelector(".scrolling-bar")

        const resp = await fetch(this._api.cameraFile)
        const { cutTimes, clips } = cameraToClips(await resp.arrayBuffer())
        const cutClips = []
        const cutActionMap = {}

        for (const [idx, cutTime] of cutTimes.entries()) {
            const clipInfo = clips[idx]
            const clip = AnimationClip.parse(clipInfo.clip)
            for (const track of clip.tracks) {
                createTrackInterpolant(track, clipInfo.interpolations[track.name], true)
            }

            // scrolling bar beat key binding
            const collectionKey = this._api.collectionKeys[Math.floor(idx / this._api.cutKeys.length)]
            const cutKey = this._api.cutKeys[idx % this._api.cutKeys.length]
            const keyBinding = collectionKey + cutKey
            const action = this._cameraMixer.clipAction(clip)
            action.setLoop(LoopOnce)
            action.clampWhenFinished = true
            cutActionMap[keyBinding] = action

            // scrolling bar beat
            const beatEl = document.createElement("div")
            beatEl.id = `beat${idx}`
            beatEl.textContent = keyBinding.toUpperCase()
            beatEl.className = "cut"
            scrollingBar.appendChild(beatEl)

            cutClips.push({
                action,
                cutTime,
                beatEl,
                keyBinding
            })
        }

        this.cutActionMap = cutActionMap
        this.cutClips = cutClips

        this.updateScrollingBar(this._api.currentTime)
    }

    async updateClips(cameraObj) {
        // remove all beats on scrolling bar
        for (const beat of document.querySelectorAll(".cut")) {
            beat.remove()
        }
        await this.init()

        this._currentAction = null
        this._origAction = cameraObj.actions[0]
        this._cameraMixer = cameraObj.mixer
    }

    playComposite(time) {

        let minDiff = null
        let targetAction = null
        let targetCutTime = null
        for (const { cutTime, action } of this.cutClips) {
            const diff = time.toFixed(2) - cutTime.toFixed(2)
            if (diff > 0) {
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
        const isCustom = this._currentAction?.isRunning() && !this.isMotionFile
        const isOrig = this._origAction.isRunning()

        if (this.isComposite) {
            this.playComposite(time)
        }
        if (isOrig) {
            if (this._currentAction?.isRunning()) {
                this._currentAction.stop()
            }
            this._cameraMixer.setTime(time)
        } else if (isCustom) {
            this._cameraMixer.setTime(time - this._cutOffset)
        }
        if (isOrig || isCustom) {
            this._camera.up.set(0, 1, 0);
            this._camera.up.applyQuaternion(this._camera.quaternion);
            this._camera.lookAt(this._camera.getObjectByName("target").position);
            this._camera.updateProjectionMatrix();
        }

        if (!this.isMotionFile) {
            this.updateScrollingBar(time)
        }
    }

    updateScrollingBar(time) {
        for (const { cutTime, beatEl } of this.cutClips) {
            if (time <= cutTime && cutTime <= time + this._scrollingDuration) {
                const timeDiff = cutTime - time
                beatEl.style.left = `${100 * (timeDiff / this._scrollingDuration)}%`;
                beatEl.style.display = "block";

                if (timeDiff < 0.1) {
                    beatEl.style.backgroundColor = "#ffdd00"
                } else {
                    beatEl.style.backgroundColor = "aqua"
                }
            } else {
                beatEl.style.display = "none";
            }
        }
    }

    updateKeyBinding() {
        // clear cutActionMap
        for (const key in this.cutActionMap) {
            delete this.cutActionMap[key]
        }
        // binding AnimationActions with keyboard shortcuts and update scrolling bar
        for (const [idx, clipInfo] of this.cutClips.entries()) {
            // update keybindings
            const modeKey = this._api.collectionKeys[Math.floor(idx / this._api.cutKeys.length)]
            const cutKey = this._api.cutKeys[idx % this._api.cutKeys.length]
            const keyBinding = modeKey + cutKey
            this.cutActionMap[keyBinding] = clipInfo.action
            // update scrolling bar
            clipInfo.beatEl.textContent = keyBinding.toUpperCase()
        }
    }
}
