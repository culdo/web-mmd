import { CameraMode } from '@/app/types/camera';
import usePresetStore from "@/app/stores/usePresetStore";
import { buildGuiItem } from "@/app/utils/gui";
import { useControls } from "leva";
import { useEffect } from "react";
import CompositeMode from "./composite-mode";
import FixFollowMode from "./fix-follow-mode";
import MotionFileMode from "./motion-file-mode";
import DjMode from "./dj-mode";
import dynamic from 'next/dynamic';
const EditorMode = dynamic(() => import('./editor-mode'), { ssr: false })

const cameraModeMap = [
    MotionFileMode,
    CompositeMode,
    FixFollowMode,
    EditorMode,
    DjMode
]

function CameraWorkHelper() {
    const cameraMode = usePresetStore(state => state["camera mode"])

    const [, set] = useControls(() => ({
        'camera mode': {
            ...buildGuiItem("camera mode") as object,
            options: {
                "Motion File": CameraMode.MOTION_FILE,
                "Composition": CameraMode.COMPOSITION,
                "Fixed Follow": CameraMode.FIXED_FOLLOW,
                "Editor": CameraMode.EDITOR,
                "DJ": CameraMode.DJ
            },
            order: 1,
        }
    }), [cameraMode])

    useEffect(() => {
        set({ "camera mode": cameraMode })
        // keyboard shortcuts
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key == "`") {
                const isEditMode = cameraMode != CameraMode.MOTION_FILE
                let targetMode;
                if (isEditMode) {
                    targetMode = CameraMode.MOTION_FILE
                } else {
                    targetMode = CameraMode.COMPOSITION
                }
                set({ "camera mode": targetMode })

            }
        }
        document.addEventListener("keydown", onKeyDown)
        return () => {
            document.removeEventListener("keydown", onKeyDown)
        }
    }, [cameraMode])

    const Mode = cameraModeMap[cameraMode]

    return <Mode />
}

export default CameraWorkHelper;