import usePresetStore from "@/app/stores/usePresetStore";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { AnimationMixer, PerspectiveCamera } from "three";
import useVMD from "../../../animation/useVMD";
import WithReady from "@/app/stores/WithReady";
import updateCamera from "../updateCamera";
import useGlobalStore from "@/app/stores/useGlobalStore";
import useClearMixer from "../useCameraMixer";


function MotionFileMode() {
    const camera = useThree(state => state.camera) as PerspectiveCamera
    const cameraMixer = useMemo(() => new AnimationMixer(camera), [camera])
    const cameraFile = usePresetStore(state => state.cameraFile)
    const player = useGlobalStore(state => state.player)
    const isMotionUpdating = useGlobalStore(state => state.isMotionUpdating)

    const updateMotion = () => {
        cameraMixer.setTime(player.currentTime)
        updateCamera(camera)
    }

    useVMD(camera, cameraMixer, cameraFile, updateMotion)

    useClearMixer(cameraMixer)

    useFrame(() => {
        if (!isMotionUpdating()) return
        updateMotion()
    }, 1)
    return <></>;
}

export default WithReady(MotionFileMode);