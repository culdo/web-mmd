import useGlobalStore from "@/app/stores/useGlobalStore"
import usePresetStore from "@/app/stores/usePresetStore"
import { useThree } from "@react-three/fiber"
import { useEffect } from "react"
import { OrbitControls } from "three-stdlib"
import ClearStage from "../../clear-stage"
import Content from "./Content"

function Scene() {
    const models = useGlobalStore(state => state.models)
    const controls = useThree(state => state.controls) as OrbitControls
    useEffect(() => {
        if (models.stage) {
            const {
                "bloom enabled": prevBloomEnabled,
                "Ambient intensity": prevAmbientIntensity,
                "auto hide GUI": prevAutoHideGui
            } = usePresetStore.getState()

            models.stage.visible = false
            controls.enabled = false
            document.getElementById("rawPlayer").style.display = "none"
            document.getElementById("intro-sections").style.display = "flex"
            useGlobalStore.setState({ gui: { hidden: true } })
            usePresetStore.setState({
                "auto hide GUI": false,
                "bloom enabled": false,
                "Ambient intensity": 0.5
            })

            return () => {
                models.stage.visible = true
                controls.enabled = true
                document.getElementById("rawPlayer").style.display = "block"
                document.getElementById("intro-sections").style.display = "none"
                useGlobalStore.setState({ gui: { hidden: false } })
                usePresetStore.setState({
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