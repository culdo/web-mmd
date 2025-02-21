import { CameraMode } from '@/app/types/camera';
import usePresetStore from "@/app/stores/usePresetStore";
import { types } from "@theatre/core";
import { useEffect } from "react";
import CompositeMode from "./composite-mode";
import FixFollowMode from "./fix-follow-mode";
import MotionFileMode from "./motion-file-mode";
import { useCurrentRafDriver, useCurrentSheet } from '@theatre/r3f';

function CameraWorkHelper() {
    const cameraMode = usePresetStore(state => state["camera mode"])

    const getCameraMode = () => usePresetStore.getState()['camera mode']

    const sheet = useCurrentSheet()
    useEffect(() => {
        const cameraModeObj = sheet.object('Camera Mode', {
            'mode': types.stringLiteral("Motion File", {
                "Motion File": CameraMode.MOTION_FILE.toString(),
                "Composition": CameraMode.COMPOSITION.toString(),
                "Fixed Follow": CameraMode.FIXED_FOLLOW.toString()
            })
        })
    }, [])


    useEffect(() => {
        // keyboard shortcuts
        document.addEventListener("keydown", (e) => {
            if (e.key == "`") {
                const isEditMode = getCameraMode() != CameraMode.MOTION_FILE
                let targetMode;
                if (isEditMode) {
                    targetMode = CameraMode.MOTION_FILE
                } else {
                    targetMode = CameraMode.COMPOSITION
                }
                // set({ "camera mode": targetMode })

            }
        })
    }, [])

    return (
        <>
            {
                cameraMode == CameraMode.COMPOSITION && <CompositeMode></CompositeMode>
            }
            {
                cameraMode == CameraMode.MOTION_FILE && <MotionFileMode></MotionFileMode>
            }
            {
                cameraMode == CameraMode.FIXED_FOLLOW && <FixFollowMode></FixFollowMode>
            }
        </>
    );
}

export default CameraWorkHelper;