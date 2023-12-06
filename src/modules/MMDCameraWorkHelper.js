import { AnimationClip, LoopOnce } from "three"
import { createTrackInterpolant } from "./MMDLoader"
import { cameraToClips } from "./cameraClipsBuilder"

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
                // pause previous action
                if (this.currentAction) {
                    this.currentAction.stop()
                }
                this.cutOffset = player.currentTime;
                if (!this.origAction.isRunning()) {
                    this.currentAction = this.cutActionMap[this.mode + e.key]
                    this.currentAction.play()
                }
            } else if(e.key == " ") {
                if(player.paused) {
                    player.play()
                } else {
                    player.pause()
                }
            } else {
                console.log(e.key == "Home")
            }
        })
    }
    static async init(cameraObj, api) {
        const scrollingBar = document.querySelector(".scrolling-bar")

        const resp = await fetch(api.cameraFile)
        const {cutTimes, clips} = cameraToClips(await resp.arrayBuffer())
        const cutClips = []
        const cutActionMap = {}

        for (const [idx, cutTime] of cutTimes.entries()) {
            const clipInfo = clips[idx]
            const clip = AnimationClip.parse(clipInfo.clip)
            for(const track of clip.tracks) {
                createTrackInterpolant(track, clipInfo.interpolations[track.name], true)
            }

            // scrolling bar beat key binding
            const modeKey = api.modeKeys[Math.floor(idx / api.cutKeys.length)]
            const cutKey = api.cutKeys[idx % api.cutKeys.length]
            const keyBinding = modeKey + cutKey
            const action = cameraObj.mixer.clipAction(clip)
            action.setLoop(LoopOnce)
            cutActionMap[keyBinding] = action

            // scrolling bar beat
            const beatEl = document.createElement("div")
            beatEl.id = `beat${idx}`
            beatEl.textContent = keyBinding.toUpperCase()
            beatEl.className = "cut"
            scrollingBar.appendChild(beatEl)

            cutClips.push({
                clip,
                cutTime,
                beatEl,
                keyBinding
            })
        }

        return new MMDCameraWorkHelper({ cameraObj, cutClips, cutActionMap, api })

    }
    setTime(time) {
        const enabled = this.currentAction?.isRunning() && this.api["cameraWork enabled"]
        if (this.origAction.isRunning()) {
            if(this.currentAction?.isRunning()) {
                this.currentAction.stop()
            }
            this.cameraMixer.setTime(time)
        } else if (enabled) {
            this.cameraMixer.setTime(time - this.cutOffset)
        }
        if (this.origAction.isRunning() || enabled) {
            this.camera.up.set(0, 1, 0);
            this.camera.up.applyQuaternion(this.camera.quaternion);
            this.camera.lookAt(this.camera.getObjectByName("target").position);
            this.camera.updateProjectionMatrix();
        }

        if(!this.api["cameraWork enabled"]) {
            return
        }
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
}
