import { CameraClip } from "@/app/modules/MMDCameraWorkHelper";
import { createTrackInterpolant } from "@/app/modules/MMDLoader";
import { cameraToClips } from "@/app/modules/cameraClipsBuilder";
import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { useFrame, useThree } from "@react-three/fiber";
import React, { Suspense, use, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimationClip, AnimationMixer, LoopOnce } from "three";

function CompositeMode({ promise }: { promise: Promise<any> }) {

    const player = useGlobalStore(state => state.player)
    const helper = useGlobalStore(state => state.helper)
    const isMotionUpdating = useGlobalStore(state => state.isMotionUpdating)
    const beatsBufferRef = useGlobalStore(state => state.beatsBufferRef)

    const camera = useThree(state => state.camera)
    const cameraMixer: AnimationMixer = useMemo(() => helper.get(camera)?.mixer, [helper, camera])

    const motionOffset = usePresetStore(state => state.motionOffset)
    const collectionKeys = usePresetStore(state => state.collectionKeys)
    const cutKeys = usePresetStore(state => state.cutKeys)


    const mmd = {
        get currentTime() {
            return player.currentTime()
        }
    }

    const scrollingDuration = 3.0  // seconds
    // Clips is a array of clipInfo for composition camera mode
    // target clips reference above clips that currently running
    // default to motion file clips
    const [initClips, initKeysToClips] = use(promise)
    const [compositeClips, setCompositeClips] = useState<CameraClip[]>(initClips)

    // Keybindings
    const [keyToClips, setKeyToClips] = useState<Record<string, CameraClip>>(initKeysToClips)

    // Current Clip
    const currentClipRef = useRef<CameraClip>()
    const [currentCollection, setCurrentCollection] = useState(collectionKeys[0])

    const clearCurrentBeat = () => {
        if (currentClipRef.current) {
            const diff = player.currentTime() - (currentClipRef.current.cutTime - (motionOffset * 0.001))
            if (Math.round(diff * 1000) == 0) {
                currentClipRef.current.action.stop()
                const idx = compositeClips.indexOf(currentClipRef.current)
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

    const resetAllBeats = () => {
        for (const beatEl of beatsBufferRef.current) {
            beatEl.style.display = "none";
        }
    }

    const playComposite = (time: number) => {

        let minDiff = null
        let targetClip = null
        for (const clip of compositeClips) {
            // round to fix cutTime precision problem
            const diff = Math.round((time - clip.cutTime) * 1000)
            if (diff >= 0) {
                if (minDiff == null || diff < minDiff) {
                    minDiff = diff
                    targetClip = clip
                }
            }
        }

        if (targetClip && targetClip != currentClipRef.current) {
            if (currentClipRef.current) {
                currentClipRef.current.action.stop()
            };
            currentClipRef.current = targetClip
            targetClip.action.play();
        }

    }

    const setTime = (time: number) => {
        playComposite(time)

        if (!currentClipRef.current.action.isRunning()) return
        updateCamera(time)
        updateScrollingBar(time)
    }

    const updateCamera = (time: number) => {
        // set clip time
        // condition to fix cutTime precision problem that cause action be disabled
        const targetTime = (time - currentClipRef.current.cutTime) < 0 ? 0 : (time - currentClipRef.current.cutTime)
        cameraMixer.setTime(targetTime)

        camera.up.set(0, 1, 0);
        camera.up.applyQuaternion(camera.quaternion);
        camera.lookAt(camera.getObjectByName("target").position);
        camera.updateProjectionMatrix();
    }
    
    const updateScrollingBar = (time: number) => {
        resetAllBeats()
        let beatsBufferIdx = 0;
        for (const { cutTime, keyBinding } of compositeClips) {

            if (time <= cutTime && cutTime <= time + scrollingDuration) {
                const beatEl = beatsBufferRef.current[beatsBufferIdx]
                beatsBufferIdx++
                const timeDiff = cutTime - time
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
        if (isMotionUpdating.current) setTime(mmd.currentTime)
    }, 0)
    return <></>;
}

function SetupCompsite() {
    const cameraFile = usePresetStore(state => state.cameraFile)
    const helper = useGlobalStore(state => state.helper)

    const camera = useThree(state => state.camera)
    const cameraMixer: AnimationMixer = useMemo(() => helper.get(camera)?.mixer, [helper, camera])

    const collectionKeys = usePresetStore(state => state.collectionKeys)
    const cutKeys = usePresetStore(state => state.cutKeys)

    // Setup functions
    const restoreInterpolant = (clip: AnimationClip, interpolations: { [x: string]: any; "target.position"?: any; ".quaternion"?: any; ".position"?: any; ".fov"?: any }) => {
        for (const track of clip.tracks) {
            createTrackInterpolant(track, interpolations[track.name], true)
        }
    }

    const createAction = (clip: AnimationClip) => {
        const action = cameraMixer.clipAction(clip)
        action.setLoop(LoopOnce, null)
        action.clampWhenFinished = true
        return action
    }

    const promise = useMemo(async () => {
        const resp = await fetch(cameraFile)
        const { cutTimes, clips: rawClips } = cameraToClips(await resp.arrayBuffer())

        const compositeClips = []
        const keysToClips: any = {}
        for (const [idx, cutTime] of cutTimes.entries()) {
            const rawClip = rawClips[idx]
            const clip = AnimationClip.parse(rawClip.clip)
            restoreInterpolant(clip, rawClip.interpolations)

            // add scrolling bar beat key binding
            const collectionKey = collectionKeys[Math.floor(idx / cutKeys.length)]
            const cutKey = cutKeys[idx % cutKeys.length]
            const keyBinding = collectionKey + cutKey
            const action = createAction(clip)

            const clipInfo = {
                action,
                cutTime,
                keyBinding,
                interpolations: rawClip.interpolations
            }
            compositeClips.push(clipInfo)
            keysToClips[keyBinding] = clipInfo
        }
        return [compositeClips, keysToClips]
    }, [])
    return (
        <Suspense fallback={null}>
            <CompositeMode promise={promise}></CompositeMode>
        </Suspense>
    );
}

export default SetupCompsite;