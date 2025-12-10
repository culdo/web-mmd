import { CameraMode } from '@/app/types/camera';
import usePresetStore from "@/app/stores/usePresetStore";
import { buildGuiItem, buildGuiObj } from "@/app/utils/gui";
import { useControls } from "leva";
import { useEffect } from "react";
import CompositeMode from "./composite-mode";
import MotionFileMode from "./motion-file-mode";
import DirectorMode from "./director-mode";
import dynamic from 'next/dynamic';
const EditorMode = dynamic(() => import('./editor-mode'), { ssr: false })

const cameraModeMap = [
    MotionFileMode,
    CompositeMode,
    DirectorMode,
    EditorMode,
]

function CameraWorkHelper() {
    const { 'camera mode': cameraMode } = useControls({
        'camera mode': {
            ...buildGuiItem("camera mode"),
            options: {
                "Motion File": CameraMode.MOTION_FILE,
                "Composition": CameraMode.COMPOSITION,
                "Director": CameraMode.DIRECTOR,
                "Editor": CameraMode.EDITOR,
            },
            order: 1,
        }
    })

    useEffect(() => {
        // keyboard shortcuts
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key == "`") {
                usePresetStore.setState(({ "camera mode": cameraMode }) => {
                    const isMotionMode = cameraMode == CameraMode.MOTION_FILE
                    const targetMode = isMotionMode ? CameraMode.COMPOSITION : CameraMode.MOTION_FILE;
                    return { "camera mode": targetMode }
                })
            }
        }
        document.addEventListener("keydown", onKeyDown)
        return () => {
            document.removeEventListener("keydown", onKeyDown)
        }
    }, [])

    const Mode = cameraModeMap[cameraMode]

    return <Mode />
}

export default CameraWorkHelper;