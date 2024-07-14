import usePresetStore from "@/app/stores/usePresetStore";
import { buildGuiItem } from "@/app/utils/gui";
import { useThree } from "@react-three/fiber";
import { EffectComposerContext } from "@react-three/postprocessing";
import { useControls } from "leva";
import { useContext } from "react";

function EffectControls() {
    const setSize = useThree(state => state.setSize)
    const setDpr = useThree(state => state.setDpr)
    const { composer } = useContext(EffectComposerContext)
    const pr1 = usePresetStore(state => state["set pixelratio 1.0"])
    const enablePBR = usePresetStore(state => state["enable PBR"])
    const showOutline = usePresetStore(state => state["show outline"])

    useControls("Effects", {
        "set pixelratio 1": buildGuiItem(pr1, (state) => {
            setSize(window.innerWidth, window.innerHeight)
            composer.setSize(window.innerWidth, window.innerHeight)
            setDpr(state ? 1.0 : window.devicePixelRatio)
        }),
        "enable PBR": buildGuiItem(enablePBR),
        "show outline": buildGuiItem(showOutline)
    }, { order: 1, collapsed: true })
    return <></>
}

export default EffectControls;