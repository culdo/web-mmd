import CameraWorkHelper from "./helper";
import { button, useControls } from "leva";
import { buildGuiItem, loadFile } from "@/app/utils/gui";
import usePresetStore from "@/app/stores/usePresetStore";

import { PerspectiveCamera } from "@react-three/drei";

function Camera() {
    const fov = usePresetStore(state => state.fov)
    const near = usePresetStore(state => state.near)
    const zoom = usePresetStore(state => state.zoom)

    useControls('Camera', {
        name: {
            ...buildGuiItem("camera"),
            editable: false
        },
        "select camera file": button(() => {
            loadFile((cameraFile, name) => {
                usePresetStore.setState({ cameraFile, camera: name })
            })
        }),
        "fov": {
            ...buildGuiItem("fov"),
            min: 0.0,
            max: 100.0
        }
    }, { order: 201, collapsed: true })

    return (
        <>
            <PerspectiveCamera
                fov={fov}
                near={near}
                zoom={zoom}
                position={[0, 10, 50]}
                makeDefault
            >
                <object3D visible={false} name="target"></object3D>
            </PerspectiveCamera>
            <CameraWorkHelper></CameraWorkHelper>
        </>
    )
}

export default Camera;