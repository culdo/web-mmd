import { CameraMode } from "@/app/modules/MMDCameraWorkHelper"
import useGlobalStore from "@/app/stores/useGlobalStore"
import usePresetStore from "@/app/stores/usePresetStore"
import { useControls } from "leva"
import { useLayoutEffect } from "react"
import useRenderLoop from "../renderLoop/useRenderLoop"

function Env() {
    const fogColor = usePresetStore(state => state["fog color"])
    const fogDensity = usePresetStore(state => state["fog density"])

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
            if (e.key == " ") {
                const player = useGlobalStore.getState().player

                if (player?.paused()) {
                    player?.play()
                } else {
                    player?.pause()
                }
            } else if (e.key == "`") {
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

    useRenderLoop()
    return (
        <>
            <fogExp2 attach="fog" color={fogColor} density={fogDensity}></fogExp2>
            <ambientLight intensity={Math.PI / 2} />
            <directionalLight position={[-10, -10, -10]} intensity={Math.PI} />
        </>
    );
}

export default Env;