import CameraWorkHelper from "./helper";
import { button, useControls } from "leva";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { buildGuiItem, loadFile } from "@/app/utils/gui";
import usePresetStore from "@/app/stores/usePresetStore";

import { PerspectiveCamera } from "@react-three/drei";
import { PerspectiveCamera as PerspectiveCameraImpl, Vector3 } from "three";
import { useThree } from "@react-three/fiber";
import { useRef } from "react";

function Camera() {
    const cameraName = usePresetStore(state => state.camera)

    const presetReady = useGlobalStore(state => state.presetReady)
    const fov = usePresetStore(state => state.fov)
    const near = usePresetStore(state => state.near)
    const zoom = usePresetStore(state => state.zoom)
    const camera = useThree(state => state.camera)
    const cameraRef = useRef<PerspectiveCameraImpl>()

    const [_, set] = useControls('Camera', () => ({
        name: {
            value: cameraName,
            editable: false
        },
        "select camera file": button(() => {
            loadFile((cameraFile, name) => {
                usePresetStore.setState({ cameraFile, camera: name })
                set({ name })
            })
        }),
        "fov": {
            ...buildGuiItem("fov"),
            min: 0.0,
            max: 100.0
        }
    }), { order: 201, collapsed: true }, [presetReady])

    return (
        <PerspectiveCamera
            ref={cameraRef}
            fov={fov}
            near={near}
            zoom={zoom}
            position={[0, 10, 50]}
            makeDefault
        >
            <object3D visible={false} name="target"></object3D>
            {
                camera == cameraRef.current &&
                <CameraWorkHelper></CameraWorkHelper>
            }
        </PerspectiveCamera>
    )
}

export default Camera;