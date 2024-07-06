import { CameraMode } from "@/app/modules/MMDCameraWorkHelper";
import usePresetStore from "@/app/stores/usePresetStore";
import CompositeMode from "./composite-mode";
import MotionFileMode from "./motion-file-mode";

function CameraWorkHelper() {
    const cameraMode = usePresetStore(state => state["camera mode"])
    return (
        <>
            {
                cameraMode == CameraMode.COMPOSITION && <CompositeMode></CompositeMode>
            }
            {
                cameraMode == CameraMode.MOTION_FILE && <MotionFileMode></MotionFileMode>
            }
        </>
    );
}

export default CameraWorkHelper;