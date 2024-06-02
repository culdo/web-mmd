import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { useThree } from "@react-three/fiber";
import { EffectComposerContext } from "@react-three/postprocessing";
import { useControls } from "leva";
import { useContext } from "react";
import * as THREE from "three";

function ComposerEffect() {
    const { setSize } = useThree()
    const { composer } = useContext(EffectComposerContext)

    useControls("Render", {
        "set pixelratio 1": {
            value: usePresetStore.getState()["set pixelratio 1.0"],
            onChange: (state, _, options) => {
                setSize(window.innerWidth, window.innerHeight)
                composer.setSize(window.innerWidth, window.innerHeight)
                if (!options.initial) {
                    usePresetStore.setState({ "set pixelratio 1.0": state })
                }
            }
        }
    }, { order: 1 })
    return <></>
}

export default ComposerEffect;