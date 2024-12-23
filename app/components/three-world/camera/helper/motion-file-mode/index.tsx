import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { onProgress } from "@/app/utils/base";
import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, use, useEffect, useMemo } from "react";
import { AnimationClip, AnimationMixer } from "three";


function MotionFileMode({ promise }: { promise: Promise<AnimationClip> }) {
    const cameraName = usePresetStore(state => state.camera)

    const clip = use(promise)

    const player = useGlobalStore(state => state.player)
    const isMotionUpdating = useGlobalStore(state => state.isMotionUpdating)

    const camera = useThree(state => state.camera)
    const cameraMixer = useMemo(() => new AnimationMixer(camera), [camera])

    const setTime = (time: number) => {
        cameraMixer.setTime(time)

        camera.up.set(0, 1, 0);
        camera.up.applyQuaternion(camera.quaternion);
        camera.lookAt(camera.getObjectByName("target").position);
        camera.updateProjectionMatrix();
    }

    useEffect(() => {
        const savedCurrentTime = usePresetStore.getState().currentTime
        
        const action = cameraMixer.clipAction(clip)
        action.play()
        setTime(savedCurrentTime)
        return () => cameraMixer.stopAllAction() && cameraMixer.uncacheRoot(camera)
    }, [camera, cameraName])

    useFrame(() => {
        if (isMotionUpdating.current) setTime(player.currentTime)
    }, 1)
    return <></>;
}

function SetupMotionFile() {
    const cameraFile = usePresetStore(state => state.cameraFile)
    const loader = useGlobalStore(state => state.loader)
    const camera = useThree(state => state.camera)

    const promise = loader.loadAnimation(cameraFile, camera, onProgress)
    return (
        <Suspense fallback={null}>
            <MotionFileMode promise={promise}></MotionFileMode>
        </Suspense>
    );
}

export default SetupMotionFile;