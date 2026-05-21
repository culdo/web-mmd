import usePresetStore from "@/app/stores/usePresetStore";
import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo } from "react";
import { AnimationMixer, PerspectiveCamera } from "three";
import useVMD from "../../../animation/useVMD";
import WithReady from "@/app/stores/WithReady";
import updateCamera from "../updateCamera";
import useGlobalStore from "@/app/stores/useGlobalStore";
import useClearMixer from "../useCameraMixer";
import useConfigStore from "@/app/stores/useConfigStore";

function MotionFileMode() {
    const camera = useThree(state => state.camera) as PerspectiveCamera
    const cameraMixer = useMemo(() => new AnimationMixer(camera), [camera])
    const cameraName = usePresetStore(state => state.camera)
    const cameraFile = useConfigStore(state => state.cameraFiles)?.[cameraName]
    const player = useGlobalStore(state => state.player)
    const playAbsDeltaRef = useGlobalStore(state => state.playAbsDeltaRef)

    const updateMotion = useCallback((delta: number) => {
        if (playAbsDeltaRef.current > 1.0 || delta === undefined) {
            cameraMixer.setTime(player.currentTime)
        } else if(!player.paused) {
            cameraMixer.update(delta)
        } else {
            return
        }
        updateCamera(camera)
    }, [cameraMixer])

    useVMD(camera, cameraMixer, cameraFile, updateMotion)

    useClearMixer(cameraMixer)

    useFrame((_, delta) => {
        updateMotion(delta)
    }, 1)
    return <></>;
}

export default WithReady(MotionFileMode);