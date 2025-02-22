import CameraWorkHelper from "./helper";
import { button, useControls } from "leva";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { buildLoadFileFn } from "@/app/utils/gui";
import usePresetStore from "@/app/stores/usePresetStore";
import { PerspectiveCamera } from "@theatre/r3f";
import { ISheetObject } from "@theatre/core";
import { CameraObj } from "@/app/types/camera";

function Camera() {
    const cameraName = usePresetStore(state => state.camera)

    const presetReady = useGlobalStore(state => state.presetReady)
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
            <PerspectiveCamera objRef={(obj: ISheetObject<CameraObj>) => useGlobalStore.setState({ "cameraObj": obj })} theatreKey="Camera" fov={fov} near={near} zoom={zoom} position={[0, 10, 50]} makeDefault>
                <object3D name="target" />
            </PerspectiveCamera>
            <CameraWorkHelper></CameraWorkHelper>
        </>
    )
}

export default Camera;