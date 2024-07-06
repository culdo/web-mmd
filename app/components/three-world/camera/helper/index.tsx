import { CameraMode } from "@/app/modules/MMDCameraWorkHelper";
import usePresetStore from "@/app/stores/usePresetStore";
import CompositeMode from "./composite-mode";
import MotionFileMode from "./motion-file-mode";
import FixFollowMode from "./fix-follow-mode";
import { useLayoutEffect } from "react";
import { useControls } from "leva";

function CameraWorkHelper() {
    const cameraMode = usePresetStore(state => state["camera mode"])

    const getCameraMode = () => usePresetStore.getState()['camera mode']
    const setCameraMode = (val: number) => usePresetStore.setState({ "camera mode": val })

    const [, set] = useControls(() => ({
        'camera mode': {
            value: getCameraMode(),
            options: {
                "Motion File": CameraMode.MOTION_FILE,
                "Composition": CameraMode.COMPOSITION,
                "Fixed Follow": CameraMode.FIXED_FOLLOW
            },
            onChange: (motionType, _, options) => {
                if (!options.initial) {
                    setCameraMode(motionType)
                }
            },
            order: 0,
        },
    }))

    useLayoutEffect(() => {
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
                set({ "camera mode": targetMode })

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