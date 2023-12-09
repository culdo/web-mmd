import { AnimationClip, LoopOnce } from "three"
import { createTrackInterpolant } from "./MMDLoader"
import { cameraToClips } from "./cameraClipsBuilder"


export const CameraMode = {
    MOTION_FILE: 0,
    COMPOSITION: 1,
    CREATIVE: 2
}
export class MMDCameraWorkHelper {
    constructor({ cameraObj, cutClips, cutActionMap, api }) {
        this.scrollingDuration = 3.0

        this.camera = cameraObj.camera
        this.api = api
        this.cutActionMap = cutActionMap
        this.origAction = cameraObj.actions[0]
        this.cameraMixer = cameraObj.mixer
        this.cutClips = cutClips
        this.mode = "1"
        this.currentAction = null
        this.cutOffset = 0

        document.addEventListener("keydown", (e) => {
            if (this.api.modeKeys.includes(e.key)) {
                this.mode = e.key
            } else if (this.api.cutKeys.includes(e.key)) {
                // stop previous action
                if (this.currentAction) {
                    this.currentAction.stop()
                }
                this.cutOffset = player.currentTime;
                if (!this.origAction.isRunning()) {
                    this.currentAction = this.cutActionMap[this.mode + e.key]
                    this.currentAction.play()
                }
            } else if (e.key == "ArrowLeft") {
                let minDiff = null
                let prevCutTime = null
                for (const { cutTime } of this.cutClips) {
                    const diff = player.currentTime.toFixed(2) - cutTime.toFixed(2)
                    if (diff > 0) {
                        if (minDiff == null || diff < minDiff) {
                            minDiff = diff
                            prevCutTime = cutTime
                        }
                    }
                }
                if (prevCutTime != null) {
                    player.currentTime = prevCutTime
                }
            } else if (e.key == "ArrowRight") {
                let minDiff = null
                let nextCutTime = null
                for (const { cutTime } of this.cutClips) {
                    const diff = cutTime.toFixed(2) - player.currentTime.toFixed(2)
                    if (diff > 0) {
                        if (minDiff == null || diff < minDiff) {
                            minDiff = diff
                            nextCutTime = cutTime
                        }
                    }
                }
                if (nextCutTime != null) {
                    player.currentTime = nextCutTime
                }
            }
        })
    }

    static async init(cameraObj, api) {
        const { cutClips, cutActionMap } = await MMDCameraWorkHelper.setup(cameraObj.mixer, api)
        const helper = new MMDCameraWorkHelper({ cameraObj, cutClips, cutActionMap, api })

        helper.updateScrollingBar(api.currentTime)
        return helper
    }

    static async setup(cameraMixer, api) {
        const scrollingBar = document.querySelector(".scrolling-bar")

        const resp = await fetch(api.cameraFile)
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
            const modeKey = api.modeKeys[Math.floor(idx / api.cutKeys.length)]
            const cutKey = api.cutKeys[idx % api.cutKeys.length]
            const keyBinding = modeKey + cutKey
            const action = cameraMixer.clipAction(clip)
            action.setLoop(LoopOnce)
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
        
        return { cutClips, cutActionMap }
    }

    async updateClips(cameraObj) {
        // remove all beats on scrolling bar
        for(const beat of document.querySelectorAll(".cut")) {
            beat.remove()
        }
        const { cutClips, cutActionMap } = await MMDCameraWorkHelper.setup(cameraObj.mixer, this.api)

        this.cutClips = cutClips
        this.updateScrollingBar(this.api.currentTime)

        this.cutActionMap = cutActionMap
        this.currentAction = null
        this.origAction = cameraObj.actions[0]
        this.cameraMixer = cameraObj.mixer
    }

    setTime(time) {
        const isEditMode = this.api["camera mode"] != CameraMode.MOTION_FILE
        const enabled = this.currentAction?.isRunning() && isEditMode
        const isOrig = this.origAction.isRunning()

        if (isOrig) {
            if (this.currentAction?.isRunning()) {
                this.currentAction.stop()
            }
            this.cameraMixer.setTime(time)
        } else if (enabled) {
            this.cameraMixer.setTime(time - this.cutOffset)
        }
        if (isOrig || enabled) {
            console.log(this.camera.quaternion.toArray())
            this.camera.up.set(0, 1, 0);
            this.camera.up.applyQuaternion(this.camera.quaternion);
            this.camera.lookAt(this.camera.getObjectByName("target").position);
            this.camera.updateProjectionMatrix();
        }

        if (isEditMode) {
            this.updateScrollingBar(time)
        }
    }

    updateScrollingBar(time) {
        for (const { cutTime, beatEl } of this.cutClips) {
            if (time <= cutTime && cutTime <= time + this.scrollingDuration) {
                const timeDiff = cutTime - time
                beatEl.style.left = `${100 * (timeDiff / this.scrollingDuration)}%`;
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
        // scrolling bar beat key binding
        for (const [idx, clipInfo] of this.cutClips.entries()) {
            const modeKey = this.api.modeKeys[Math.floor(idx / this.api.cutKeys.length)]
            const cutKey = this.api.cutKeys[idx % this.api.cutKeys.length]
            const keyBinding = modeKey + cutKey
            this.cutActionMap[keyBinding] = clipInfo.action
            clipInfo.beatEl.textContent = keyBinding.toUpperCase()
        }
    }
}
