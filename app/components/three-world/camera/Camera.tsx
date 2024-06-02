import { CameraMode } from "@/app/modules/MMDCameraWorkHelper";
import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { onProgress } from "@/app/utils/base";
import { PerspectiveCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

function Camera() {
    const { camera } = useThree()

    const globalState = useGlobalStore()
    const api = usePresetStore()
    const { helper, cwHelper, character, controls, loader } = globalState

    useEffect(() => {
        if (!character || !controls) return

        const loadCamera = async (url = api.cameraFile, filename = api.camera) => {

            const cameraAnimation = await loader.loadAnimation(url, camera, onProgress);
            helper.add(camera, {
                animation: cameraAnimation,
                enabled: api["camera mode"] == CameraMode.MOTION_FILE
            });

            await cwHelper.init({ ...globalState, api, camera });
            if (api.cameraFile != url) {
                api.camera = filename;
                api.cameraFile = url;
            }
        }
        loadCamera()
        useGlobalStore.setState({ loadCamera })
    }, [character, controls, api.camera])
    return (
        <PerspectiveCamera fov={api.fov} near={api.near} zoom={api.zoom} makeDefault></PerspectiveCamera>
    )
}

export default Camera;