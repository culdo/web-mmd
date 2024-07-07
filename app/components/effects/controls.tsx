import usePresetStore from "@/app/stores/usePresetStore";
import { useThree } from "@react-three/fiber";
import { EffectComposerContext } from "@react-three/postprocessing";
import { useControls } from "leva";
import { useContext } from "react";

function EffectControls() {
    const setSize = useThree(state => state.setSize)
    const { composer } = useContext(EffectComposerContext)
    const pr1 = usePresetStore(state => state["set pixelratio 1.0"])
    const enablePBR = usePresetStore(state => state["enable PBR"])
    const showOutline = usePresetStore(state => state["show outline"])

    useControls("Effects", {
        "set pixelratio 1": {
            value: pr1,
            onChange: (state, _, options) => {
                setSize(window.innerWidth, window.innerHeight)
                composer.setSize(window.innerWidth, window.innerHeight)
                if (!options.initial) {
                    usePresetStore.setState({ "set pixelratio 1.0": state })
                }
            }
        },
        "enable PBR": {
            value: enablePBR,
            onChange: (state, _, options) => {
                if (!options.initial) {
                    usePresetStore.setState({ "enable PBR": state })
                }
            }
        }, 
        "show outline": {
            value: showOutline,
            onChange: (state, _, options) => {
                if (!options.initial) {
                    usePresetStore.setState({ "show outline": state })
                }
            }
        }
    }, { order: 1, collapsed: true })
    return <></>
}

export default EffectControls;