import { CameraMode } from "@/app/modules/MMDCameraWorkHelper";
import usePresetStore from "@/app/stores/usePresetStore";
import CompositeMode from "./composite-mode";
import { useEffect } from "react";

function CameraWorkHelper() {

    const cameraMode = usePresetStore(state => state["camera mode"])
    return (
        <>
            {
                cameraMode == CameraMode.COMPOSITION && <CompositeMode></CompositeMode>
            }
        </>
    );
}

export default CameraWorkHelper;