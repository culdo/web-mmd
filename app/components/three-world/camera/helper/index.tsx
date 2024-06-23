import { CameraMode } from "@/app/modules/MMDCameraWorkHelper";
import usePresetStore from "@/app/stores/usePresetStore";
import CompositeMode from "./composite-mode";
import useGlobalStore from "@/app/stores/useGlobalStore";

function CameraWorkHelper() {
    const cameraMode = usePresetStore(state => state["camera mode"])
    const loadCamera = useGlobalStore(state => state.loadCamera)
    const player = useGlobalStore(state => state.player)
    return (
        <>
            {
                cameraMode == CameraMode.COMPOSITION && loadCamera && player && <CompositeMode></CompositeMode>
            }
        </>
    );
}

export default CameraWorkHelper;