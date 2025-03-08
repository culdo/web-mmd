import usePresetStore from "@/app/stores/usePresetStore";
import { useThree } from "@react-three/fiber";
import { useCallback, useMemo } from "react";
import { AnimationMixer, PerspectiveCamera } from "three";
import useVMD from "../../../animation/useVMD";
import WithSuspense from "@/app/components/suspense";
import WithReady from "@/app/stores/WithReady";
import updateCamera from "../updateCamera";


function MotionFileMode() {
    const camera = useThree(state => state.camera)
    const cameraMixer = useMemo(() => new AnimationMixer(camera), [camera])
    const cameraFile = usePresetStore(state => state.cameraFile)
    const setTimeCb = useCallback((setTime: () => void) => {
        setTime();
        updateCamera(camera as PerspectiveCamera)
    }, [camera, cameraMixer])
    useVMD(camera, cameraMixer, cameraFile, setTimeCb)
    return <></>;
}

export default WithReady(MotionFileMode);