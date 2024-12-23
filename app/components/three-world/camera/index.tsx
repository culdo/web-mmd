import { PerspectiveCamera } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { PerspectiveCamera as PerspectiveCameraImpl } from "three";
import CameraWorkHelper from "./helper";
import { button, useControls } from "leva";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { buildGuiItem, buildLoadFileFn } from "@/app/utils/gui";
import { useThree } from "@react-three/fiber";
import defaultConfig from '@/app/configs/Default_config.json';
import usePresetStore from "@/app/stores/usePresetStore";

function Camera() {
    const cameraRef = useRef<PerspectiveCameraImpl>()
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
    }), { order: 2, collapsed: true }, [presetReady])

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