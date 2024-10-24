import { CameraMode } from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { buildGuiItem, buildLoadFileFn } from "@/app/utils/gui";
import { button, useControls } from "leva";
import { useEffect } from "react";
import CompositeMode from "./composite-mode";
import FixFollowMode from "./fix-follow-mode";
import MotionFileMode from "./motion-file-mode";

function CameraWorkHelper() {
    const cameraMode = usePresetStore(state => state["camera mode"])
    const cameraName = usePresetStore(state => state.camera)

    const getCameraMode = () => usePresetStore.getState()['camera mode']

    const [, set] = useControls(() => ({
        'camera mode': {
            ...buildGuiItem("camera mode") as object,
            options: {
                "Motion File": CameraMode.MOTION_FILE,
                "Composition": CameraMode.COMPOSITION,
                "Fixed Follow": CameraMode.FIXED_FOLLOW
            },
            order: 0,
        },
    }), [cameraMode])

    const [_, setCameraGui] = useControls('MMD Files', () => ({
        camera: {
            value: cameraName,
            editable: false
        },
        "select camera file": button(() => {
            const selectFile = document.getElementById("selectFile") as HTMLInputElement
            selectFile.onchange = buildLoadFileFn((cameraFile, camera) => {
                usePresetStore.setState({ cameraFile, camera })
                setCameraGui({ camera })
            })
            selectFile.click();
        }),
    }), { order: 2 }, [cameraName])

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