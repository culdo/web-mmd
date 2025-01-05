import usePresetStore from "@/app/stores/usePresetStore";
import { useThree } from "@react-three/fiber";
import { useCallback, useMemo } from "react";
import { AnimationMixer } from "three";
import useAnimation from "../../../animation/useAnimation";
import WithSuspense from "@/app/components/suspense";


function MotionFileMode() {
    const camera = useThree(state => state.camera)
    const cameraMixer = useMemo(() => new AnimationMixer(camera), [camera])
    const cameraFile = usePresetStore(state => state.cameraFile)
    const setTimeCb = useCallback(() => {
        camera.up.set(0, 1, 0);
        camera.up.applyQuaternion(camera.quaternion);
        camera.lookAt(camera.getObjectByName("target").position);
        camera.updateProjectionMatrix();
    }, [camera, cameraMixer])
    useAnimation(camera, cameraMixer, cameraFile, setTimeCb)
    return <></>;
}

export default WithSuspense(MotionFileMode);