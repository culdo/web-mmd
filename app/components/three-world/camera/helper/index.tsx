import { CameraMode } from '@/app/types/camera';
import usePresetStore from "@/app/stores/usePresetStore";
import { buildGuiItem } from "@/app/utils/gui";
import { useControls } from "leva";
import { useEffect } from "react";
import CompositeMode from "./composite-mode";
import FixFollowMode from "./fix-follow-mode";
import MotionFileMode from "./motion-file-mode";
import EditorMode from './editor-mode';

const cameraModeMap = [
    MotionFileMode,
    CompositeMode,
    FixFollowMode,
    EditorMode
]

function CameraWorkHelper() {
    const cameraMode = usePresetStore(state => state["camera mode"])

    const getCameraMode = () => usePresetStore.getState()['camera mode']

    const [, set] = useControls(() => ({
        'camera mode': {
            ...buildGuiItem("camera mode") as object,
            options: {
                "Motion File": CameraMode.MOTION_FILE,
                "Composition": CameraMode.COMPOSITION,
                "Fixed Follow": CameraMode.FIXED_FOLLOW,
                "Editor": CameraMode.EDITOR
            },
            order: 0,
        },
    }), [cameraMode])

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
                set({ "camera mode": targetMode })

            }
        })
    }, [])

    const Mode = cameraModeMap[cameraMode]

    return <Mode />
}

export default CameraWorkHelper;