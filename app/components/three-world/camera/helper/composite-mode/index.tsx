import { CameraClip } from "@/app/modules/MMDCameraWorkHelper";
import { createTrackInterpolant } from "@/app/modules/MMDLoader";
import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimationClip, AnimationMixer, LoopOnce } from "three";
import styles from "./styles.module.css";

function CompositeMode() {

    const player = useGlobalStore(state => state.player)
    const helper = useGlobalStore(state => state.helper)
    const isMotionUpdating = useGlobalStore(state => state.isMotionUpdating)

    const cameraMixer: AnimationMixer = useMemo(() => helper.get(camera).mixer, [helper])

    const camera = useThree(state => state.camera)
    const motionOffset = usePresetStore(state => state.motionOffset)
    const collectionKeys = usePresetStore(state => state.collectionKeys)
    const cutKeys = usePresetStore(state => state.cutKeys)
    const savedCompositeClips = usePresetStore(state => state.compositeClips)

    const mmd = {
        get currentTime() {
            return player.currentTime()
        }
    }

    const scrollingDuration = 3.0  // seconds

    // Clips is a array of clipInfo for composition camera mode
    // target clips reference above clips that currently running
    // default to motion file clips
    const [compositeClips, setCompositeClips] = useState<CameraClip[]>(savedCompositeClips.map((cameraClip) => {

        const aniClip = AnimationClip.parse(cameraClip.clipJson)
        if (!cameraClip.interpolations) {
            usePresetStore.setState({ compositeClips: [] })
            setTimeout(() => location.reload(), 5000)
        }
        restoreInterpolant(aniClip, cameraClip.interpolations)
        cameraClip.action = createAction(aniClip)

        delete cameraClip.clipJson
        return cameraClip
    }))

    // Keybindings
    const [keyToClips, setKeyToClips] = useState<Record<string, CameraClip>>(
        Object.fromEntries(
            compositeClips.map(cameraClip => [cameraClip.keyBinding, cameraClip])
        )
    )

    // Current Clip
    const [currentClip, setCurrentClip] = useState<CameraClip>()
    const [currentCollection, setCurrentCollection] = useState(collectionKeys[0])

    const beatsBufferRef = useRef<React.RefObject<HTMLDivElement>[]>([])

    const beatsBuffer = useMemo(() => [...Array(30)].map(_ => {
        const ref = React.createRef<HTMLDivElement>()
        const beatEl = React.createElement("div", { className: "cut", style: { display: "none" }, ref })
        beatsBufferRef.current.push(ref)
        return beatEl
    }), [])

    const clearCurrentBeat = () => {
        if (currentClip) {
            const diff = player.currentTime() - (currentClip.cutTime - (motionOffset * 0.001))
            if (Math.round(diff * 1000) == 0) {
                currentClip.action.stop()
                const idx = compositeClips.indexOf(currentClip)
                compositeClips.splice(idx, 1)
            }
        }
    }
    const saveCompositeClips = () => {
        setCompositeClips(compositeClips)
        const json = []
        for (const clip of compositeClips) {
            const { action: _, ...saveClip } = clip;
            saveClip.clipJson = AnimationClip.toJSON(clip.action.getClip())
            json.push(saveClip)
        }

        usePresetStore.setState({ compositeClips: json })

    }

    const createAction = (clip: AnimationClip) => {
        const action = cameraMixer.clipAction(clip)
        action.setLoop(LoopOnce, null)
        action.clampWhenFinished = true
        return action
    }

    const resetAllBeats = () => {
        for (const beatEl of beatsBufferRef.current) {
            beatEl.current.style.display = "none";
        }
    }

    const restoreInterpolant = (clip: AnimationClip, interpolations: { [x: string]: any; "target.position"?: any; ".quaternion"?: any; ".position"?: any; ".fov"?: any }) => {
        for (const track of clip.tracks) {
            createTrackInterpolant(track, interpolations[track.name], true)
        }
    }

    const playComposite = () => {

        let minDiff = null
        let targetClip = null
        const cTime = mmd.currentTime
        for (const clip of compositeClips) {
            // round to fix cutTime precision problem
            const diff = Math.round((cTime - clip.cutTime) * 1000)
            if (diff >= 0) {
                if (minDiff == null || diff < minDiff) {
                    minDiff = diff
                    targetClip = clip
                }
            }
        }

        if (targetClip && targetClip != currentClip) {
            if (currentClip) {
                currentClip.action.stop()
            };
            setCurrentClip(targetClip)
            targetClip.action.play();
        }

    }

    const setTime = (time: number) => {
        playComposite()

        // set clip time
        // condition to fix cutTime precision problem that cause action be disabled
        const targetTime = (time - currentClip.cutTime) < 0 ? 0 : (time - currentClip.cutTime)
        cameraMixer.setTime(targetTime)

        camera.up.set(0, 1, 0);
        camera.up.applyQuaternion(camera.quaternion);
        camera.lookAt(camera.getObjectByName("target").position);
        camera.updateProjectionMatrix();

        updateScrollingBar()
    }

    const updateScrollingBar = () => {
        resetAllBeats()
        let beatsBufferIdx = 0;
        for (const { cutTime, keyBinding } of compositeClips) {

            if (mmd.currentTime <= cutTime && cutTime <= mmd.currentTime + scrollingDuration) {
                const beatEl = beatsBufferRef.current[beatsBufferIdx].current
                beatsBufferIdx++
                const timeDiff = cutTime - mmd.currentTime
                beatEl.style.left = `${100 * (timeDiff / scrollingDuration)}%`;
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

    const updateKeyBinding = () => {
        // clear cutActionMap
        for (const key in keyToClips) {
            delete keyToClips[key]
        }
        // binding AnimationActions with keyboard shortcuts and update scrolling bar
        for (const [idx, clipInfo] of compositeClips.entries()) {
            // update keybindings
            const modeKey = collectionKeys[Math.floor(idx / cutKeys.length)]
            const cutKey = cutKeys[idx % cutKeys.length]
            const keyBinding = modeKey + cutKey
            clipInfo.keyBinding = keyBinding
            keyToClips[keyBinding] = clipInfo
        }
        setKeyToClips(keyToClips)
    }

    useEffect(() => {
        const onKeydown = (e: KeyboardEvent) => {
            // not trigger on default keyboard shortcuts
            // e.preventDefault()
            if (e.ctrlKey || e.metaKey) {
                return
            }
            const pressedKeyBinding = currentCollection + e.key
            if (collectionKeys.includes(e.key)) {
                setCurrentCollection(e.key)
                // composite mode 
            } else if (pressedKeyBinding in keyToClips) {

                // if we have another beat(pressed ArrowLeft), clear it
                clearCurrentBeat()

                const targetClip = keyToClips[pressedKeyBinding]
                targetClip.cutTime = mmd.currentTime

                compositeClips.push(targetClip)
                saveCompositeClips()
                setTime(mmd.currentTime)

            } else if (e.key == "ArrowLeft") {
                let minDiff = null
                let prevClip = null
                for (const clip of compositeClips) {
                    const diff = Math.round((mmd.currentTime - clip.cutTime) * 1000)
                    if (diff > 0) {
                        if (minDiff == null || diff < minDiff) {
                            minDiff = diff
                            prevClip = clip
                        }
                    }
                }
                if (prevClip != null) {
                    prevClip.action.reset()
                    player.currentTime(prevClip.cutTime - (motionOffset * 0.001))
                }
            } else if (e.key == "ArrowRight") {
                let minDiff = null
                let nextCutTime = null
                for (const { cutTime } of compositeClips) {
                    const diff = Math.round((cutTime - mmd.currentTime) * 1000)
                    if (diff > 0) {
                        if (minDiff == null || diff < minDiff) {
                            minDiff = diff
                            nextCutTime = cutTime
                        }
                    }
                }
                if (nextCutTime != null) {
                    player.currentTime(nextCutTime - (motionOffset * 0.001))
                }
            } else if (["Delete", "Backspace"].includes(e.key)) {
                clearCurrentBeat()
                saveCompositeClips()
                setTime(mmd.currentTime)
            }
        }
        document.addEventListener("keydown", onKeydown)
        return () => document.removeEventListener("keydown", onKeydown)
    })

    useFrame(() => {
        if(isMotionUpdating.current) setTime(mmd.currentTime)
    })
    return (
        <div className={styles["scrolling-bar"]}>
            <hr />
            <div className={styles["hit-point"]}></div>
            {beatsBuffer}
        </div>
    );
}

export default CompositeMode;