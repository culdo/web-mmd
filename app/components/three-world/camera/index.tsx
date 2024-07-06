import usePresetStore from "@/app/stores/usePresetStore";
import { PerspectiveCamera } from "@react-three/drei";
import { useRef } from "react";
import { PerspectiveCamera as PerspectiveCameraImpl } from "three";
import CameraWorkHelper from "./helper";

function Camera() {
    const cameraRef = useRef<PerspectiveCameraImpl>()
    const fov = usePresetStore(state => state.fov)
    const near = usePresetStore(state => state.near)
    const zoom = usePresetStore(state => state.zoom)

    return (
        <>
            <PerspectiveCamera ref={cameraRef} fov={fov} near={near} zoom={zoom} position={[0, 10, 50]} makeDefault>
                <object3D name="target" userData={{ frameNum: 0 }} />
            </PerspectiveCamera>
            <CameraWorkHelper></CameraWorkHelper>
        </>
    )
}

export default Camera;