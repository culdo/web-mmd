import usePresetStore from "@/app/stores/usePresetStore";
import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { AnimationMixer, PerspectiveCamera } from "three";
import useVMD from "../../../animation/useVMD";
import WithReady from "@/app/stores/WithReady";
import updateCamera from "../updateCamera";
import useGlobalStore from "@/app/stores/useGlobalStore";
import useClearMixer from "../useCameraMixer";
import useConfigStore from "@/app/stores/useConfigStore";
import useSetMotion from "../../../animation/useSetMotion";

function MotionFileMode() {
    const camera = useThree(state => state.camera) as PerspectiveCamera
    const cameraMixer = useMemo(() => new AnimationMixer(camera), [camera])
    const cameraName = usePresetStore(state => state.camera)
    const cameraFile = useConfigStore(state => state.cameraFiles)?.[cameraName]
    const player = useGlobalStore(state => state.player)
    
    const isSetMotionRef = useSetMotion()

    useVMD(camera, cameraMixer, cameraFile, () => {
        isSetMotionRef.current = true
    })

    useClearMixer(cameraMixer)

    useFrame((_, delta) => {
        if (isSetMotionRef.current) {
            cameraMixer.setTime(player.currentTime)
            isSetMotionRef.current = false
        } else if(!player.paused) {
            cameraMixer.update(delta)
        } else {
            return
        }
        updateCamera(camera)
    }, 1)
    return <></>;
}

export default WithReady(MotionFileMode);