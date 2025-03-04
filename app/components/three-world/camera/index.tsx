import CameraWorkHelper from "./helper";
import { button, useControls } from "leva";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { buildLoadFileFn } from "@/app/utils/gui";
import usePresetStore from "@/app/stores/usePresetStore";
import { PerspectiveCamera as PerspectiveCameraTheaTre, SheetProvider } from "@theatre/r3f";
import { getProject, ISheetObject } from "@theatre/core";
import { editable as e } from "@theatre/r3f"
import { CameraMode, CameraObj } from "@/app/types/camera";
import { PerspectiveCamera } from "@react-three/drei";
import { useRef } from "react";
import { Mesh } from "three";

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

    const setCameraObj = (obj: ISheetObject<CameraObj>) => {
        useGlobalStore.setState({ "cameraObj": obj })
    }

    const targetRef = useRef<Mesh>()

    return (
        <>
            {
                cameraMode == CameraMode.EDITOR ?
                    <SheetProvider sheet={getProject('MMD').sheet("MMD UI")}>
                        <PerspectiveCameraTheaTre objRef={setCameraObj} theatreKey="Camera" fov={fov} near={near} zoom={zoom} position={[0, 10, 50]} makeDefault>
                            <e.mesh ref={targetRef} theatreKey="Camera Target" name="target" />
                        </PerspectiveCameraTheaTre>
                    </SheetProvider> :
                    <PerspectiveCamera fov={fov} near={near} zoom={zoom} position={[0, 10, 50]} makeDefault>
                        <mesh name="target" />
                    </PerspectiveCamera>
            }
            <CameraWorkHelper></CameraWorkHelper>
        </>
    )
}

export default Camera;