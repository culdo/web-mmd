import { CameraMode } from "@/app/modules/MMDCameraWorkHelper";
import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { onProgress } from "@/app/utils/base";
import { PerspectiveCamera } from "@react-three/drei";
import { RootState, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect } from "react";
import { PerspectiveCamera as PerspectiveCameraImpl } from "three";

function Camera() {
    const { camera } = useThree<RootState & { camera: PerspectiveCameraImpl }>()

    const globalState = useGlobalStore()
    const api = usePresetStore()
    const { helper, cwHelper, character, controls, loader, player } = globalState

    useEffect(() => {
        if (!character || !controls || !player) return

        const loadCamera = async (url = api.cameraFile, filename = api.camera) => {

            const cameraAnimation = await loader.loadAnimation(url, camera, onProgress);
            helper.add(camera, {
                animation: cameraAnimation,
                enabled: api["camera mode"] == CameraMode.MOTION_FILE
            });

            // await cwHelper.init({ ...globalState, api, camera });
            if (api.cameraFile != url) {
                api.camera = filename;
                api.cameraFile = url;
            }
            useGlobalStore.setState({ loadCamera })
        }
        loadCamera()
    }, [character, controls, player, api.camera])

    const gui = useControls({
        enabled: false
    })

    return (
        <>
            {
                gui.enabled &&
                <PerspectiveCamera fov={api.fov} near={api.near} zoom={api.zoom} makeDefault></PerspectiveCamera>
            }
        </>
    )
}

export default Camera;