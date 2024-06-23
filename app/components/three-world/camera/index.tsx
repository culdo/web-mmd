import { CameraMode } from "@/app/modules/MMDCameraWorkHelper";
import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { onProgress } from "@/app/utils/base";
import { PerspectiveCamera } from "@react-three/drei";
import { useLayoutEffect, useRef } from "react";
import { PerspectiveCamera as PerspectiveCameraImpl } from "three";
import CameraWorkHelper from "./helper";

function Camera() {
    const cameraRef = useRef<PerspectiveCameraImpl>()

    const helper = useGlobalStore(state => state.helper)
    const loader = useGlobalStore(state => state.loader)
    const cameraFile = usePresetStore(state => state.cameraFile)
    const cameraMode = usePresetStore(state => state["camera mode"])
    const fov = usePresetStore(state => state.fov)
    const near = usePresetStore(state => state.near)
    const zoom = usePresetStore(state => state.zoom)

    useLayoutEffect(() => {
        const loadCamera = async () => {

            const cameraAnimation = await loader.loadAnimation(cameraFile, cameraRef.current, onProgress);
            helper.add(cameraRef.current, {
                animation: cameraAnimation,
                enabled: cameraMode == CameraMode.MOTION_FILE
            });

            useGlobalStore.setState({ loadCamera })
        }
        loadCamera()

    }, [cameraFile])

    return (
        <>
            <PerspectiveCamera ref={cameraRef} fov={fov} near={near} zoom={zoom} position={[0, 10, 50]} makeDefault />
            <CameraWorkHelper></CameraWorkHelper>
        </>
    )
}

export default Camera;