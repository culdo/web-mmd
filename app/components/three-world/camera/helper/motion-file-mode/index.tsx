import usePresetStore from "@/app/stores/usePresetStore";
import { useThree } from "@react-three/fiber";
import { useCallback, useMemo } from "react";
import { AnimationMixer } from "three";
import useVMD from "../../../animation/useVMD";
import WithSuspense from "@/app/components/suspense";
import usePresetReady from "@/app/stores/usePresetReady";


function MotionFileMode() {
    const camera = useThree(state => state.camera)
    const cameraMixer = useMemo(() => new AnimationMixer(camera), [camera])
    usePresetReady()
    const cameraFile = usePresetStore(state => state.cameraFile)
    const setTimeCb = useCallback((setTime: () => void) => {
        setTime();
        camera.up.set(0, 1, 0);
        camera.up.applyQuaternion(camera.quaternion);
        camera.lookAt(camera.getObjectByName("target").position);
        camera.updateProjectionMatrix();
    }, [camera, cameraMixer])
    useVMD(camera, cameraMixer, cameraFile, setTimeCb)
    return <></>;
}

export default WithSuspense(MotionFileMode);