import useGlobalStore from "@/app/stores/useGlobalStore"
import usePresetStore from "@/app/stores/usePresetStore"
import { useEffect } from "react"
import ClearStage from "../../clear-stage"
import Content from "./Content"
import { CameraMode } from "@/app/types/camera"

function Scene() {
    const models = useGlobalStore(state => state.models)
    useEffect(() => {
        if (models.stage) {
            const {
                "camera mode": prevCameraMode,
                "bloom enabled": prevBloomEnabled,
                "Ambient intensity": prevAmbientIntensity,
                "auto hide GUI": prevAutoHideGui
            } = usePresetStore.getState()

            models.stage.visible = false
            document.getElementById("rawPlayer").style.display = "none"
            document.getElementById("intro-sections").style.display = "flex"
            useGlobalStore.setState({ gui: { hidden: true } })
            usePresetStore.setState({
                "camera mode": CameraMode.MOTION_FILE,
                "auto hide GUI": false,
                "bloom enabled": false,
                "Ambient intensity": 0.5
            })

            return () => {
                models.stage.visible = true
                document.getElementById("rawPlayer").style.display = "block"
                document.getElementById("intro-sections").style.display = "none"
                useGlobalStore.setState({ gui: { hidden: false } })
                usePresetStore.setState({
                    "camera mode": prevCameraMode,
                    "auto hide GUI": prevAutoHideGui,
                    "bloom enabled": prevBloomEnabled,
                    "Ambient intensity": prevAmbientIntensity
                })

            }
        }
    }, [models.stage])

    useEffect(() => {
        const onKeydown = (e: KeyboardEvent) => {
            if (e.key == "Escape") {
                useGlobalStore.setState(({ gui }) => {
                    return { gui: { hidden: !gui.hidden } }
                })
            }
        }
        document.addEventListener("keydown", onKeydown)
        return () => {
            document.removeEventListener("keydown", onKeydown)
        }
    }, [])

    return (
        <>
            <ClearStage />
            <Content />
        </>
    );
}

export default Scene