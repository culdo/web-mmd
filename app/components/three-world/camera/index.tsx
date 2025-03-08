import CameraWorkHelper from "./helper";
import { button, useControls } from "leva";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { buildLoadFileFn } from "@/app/utils/gui";
import usePresetStore from "@/app/stores/usePresetStore";

import { CameraMode } from "@/app/types/camera";
import { PerspectiveCamera } from "@react-three/drei";

function Camera() {
    const cameraName = usePresetStore(state => state.camera)

    const presetReady = useGlobalStore(state => state.presetReady)
    const cameraMode = usePresetStore(state => state["camera mode"])
    const fov = usePresetStore(state => state.fov)
    const near = usePresetStore(state => state.near)
    const zoom = usePresetStore(state => state.zoom)

    const [_, set] = useControls('Camera', () => ({
        name: {
            value: cameraName,
            editable: false
        },
        "select camera file": button(() => {
            const selectFile = document.getElementById("selectFile") as HTMLInputElement
            selectFile.onchange = buildLoadFileFn((cameraFile, name) => {
                usePresetStore.setState({ cameraFile, camera: name })
                set({ name })
            })
            selectFile.click();
        }),
    }), { order: 201, collapsed: true }, [presetReady])

    return (
        <>
            {
                cameraMode != CameraMode.EDITOR &&
                <PerspectiveCamera fov={fov} near={near} zoom={zoom} position={[0, 10, 50]} makeDefault>
                    <mesh name="target" userData={{ distance: 0 }} />
                </PerspectiveCamera>
            }
            <CameraWorkHelper></CameraWorkHelper>
        </>
    )
}

export default Camera;