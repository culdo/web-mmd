import CameraWorkHelper from "./helper";
import { button, useControls } from "leva";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { buildGuiItem, buildLoadFileFn } from "@/app/utils/gui";
import defaultConfig from '@/app/presets/Default_config.json';
import usePresetStore from "@/app/stores/usePresetStore";
import { PerspectiveCamera } from "@theatre/r3f";
import { ISheetObject } from "@theatre/core";
import { CameraObj } from "@/app/types/camera";

function Camera() {
    const cameraName = usePresetStore(state => state.camera)

    const presetReady = useGlobalStore(state => state.presetReady)

    const [{ fov, near, zoom }, set] = useControls('Camera', () => ({
        fov: {
            ...buildGuiItem("fov"),
            min: 0,
            max: 100
        },
        near: {
            ...buildGuiItem("near"),
            min: 0,
            max: 5
        },
        zoom: {
            ...buildGuiItem("zoom"),
            min: 0,
            max: 100
        },
        reset: button(() => {
            const { fov, near, zoom } = defaultConfig
            set({ fov, near, zoom })
        }),
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