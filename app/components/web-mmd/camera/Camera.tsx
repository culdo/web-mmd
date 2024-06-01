import { CameraMode } from "@/app/modules/MMDCameraWorkHelper";
import { MMDLoader } from "@/app/modules/MMDLoader";
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
    const { helper, cwHelper, character, controls } = globalState
    
    useEffect(() => {
        if (!api || !helper || !cwHelper || !character || !controls) return

        const loadCamera = async (url = api.cameraFile, filename = api.camera) => {

            const cameraAnimation = await (new MMDLoader()).loadAnimation(url, camera, onProgress);
            helper.add(camera, {
                animation: cameraAnimation,
                enabled: api["camera mode"] == CameraMode.MOTION_FILE
            });

            await cwHelper.init({ ...globalState, camera });
            if (api.cameraFile != url) {
                api.camera = filename;
                api.cameraFile = url;
            }
        }
        const init = async () => {
            await loadCamera()
            useGlobalStore.setState({
                loadCamera
            })
        }
        init()
    }, [api, character, controls])
    return (
        <PerspectiveCamera makeDefault></PerspectiveCamera>
    )
}

export default Camera;