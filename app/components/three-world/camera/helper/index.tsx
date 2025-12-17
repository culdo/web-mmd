import { CameraMode } from '@/app/types/camera';
import { buildGuiItem } from "@/app/utils/gui";
import { useControls } from "leva";
import MotionFileMode from "./motion-file-mode";
import FixFollowingMode from "./fix-following-mode";
import DirectorMode from "./director-mode";
import AR from "./ar-mode";
import dynamic from 'next/dynamic';
const EditorMode = dynamic(() => import('./editor-mode'), { ssr: false })

const cameraModeMap = [
    MotionFileMode,
    FixFollowingMode,
    DirectorMode,
    EditorMode,
    AR
]

function CameraWorkHelper() {
    const { 'camera mode': cameraMode } = useControls({
        'camera mode': {
            ...buildGuiItem("camera mode"),
            options: {
                "Motion File": CameraMode.MOTION_FILE,
                "Fix Following": CameraMode.FIX_FOLLOWING,
                "Director": CameraMode.DIRECTOR,
                "Editor": CameraMode.EDITOR,
                "AR": CameraMode.AR,
            },
            order: 1,
        }
    })

    const Mode = cameraModeMap[cameraMode % cameraModeMap.length];

    return <Mode />
}

export default CameraWorkHelper;