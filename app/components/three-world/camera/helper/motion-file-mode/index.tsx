import usePresetStore from "@/app/stores/usePresetStore";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { AnimationAction, AnimationMixer, PerspectiveCamera } from "three";
import useVMD from "../../../animation/useVMD";
import WithReady from "@/app/stores/WithReady";
import updateCamera from "../updateCamera";
import useGlobalStore from "@/app/stores/useGlobalStore";
import useClearMixer from "../useCameraMixer";
import useConfigStore from "@/app/stores/useConfigStore";
import useSetMotion from "../../../animation/useSetMotion";
import { OrbitControls } from "three-stdlib";

function MotionFileMode() {
    const camera = useThree(state => state.camera) as PerspectiveCamera
    const cameraMixer = useMemo(() => new AnimationMixer(camera), [camera])
    const cameraName = usePresetStore(state => state.camera)
    const cameraFile = useConfigStore(state => state.cameraFiles)?.[cameraName]
    const player = useGlobalStore(state => state.player)
    const controls = useThree(state => state.controls) as OrbitControls

    const isSetMotionRef = useSetMotion()

    useEffect(() => {
        let isEnded = false;
        const onFinished = (e: {
            action: AnimationAction;
            direction: number;
        }) => {
            e.action.enabled = true
            if (isEnded) {
                isEnded = false
                return
            }
            isEnded = true
            player.pause()
            const onPlay = () => {
                player.currentTime = 0.0
            }
            player.addEventListener("seeked", () => {
                player.removeEventListener("play", onPlay)
            }, { once: true })
            player.addEventListener("play", onPlay, { once: true })
        }
        cameraMixer.addEventListener('finished', onFinished);
        return () => {
            cameraMixer.removeEventListener('finished', onFinished)
        }
    }, [cameraMixer, player])

    useVMD(camera, cameraMixer, cameraFile, () => {
        isSetMotionRef.current = true
    })

    useClearMixer(cameraMixer)

    useFrame((_, delta) => {
        if (isSetMotionRef.current) {
            cameraMixer.setTime(player.currentTime)
            isSetMotionRef.current = false
        } else if (!player.paused) {
            cameraMixer.update(delta)
        } else {
            return
        }
        updateCamera(camera, controls)
    }, 1)
    return <></>;
}

export default WithReady(MotionFileMode);