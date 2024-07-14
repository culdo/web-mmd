import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { buildGuiItem } from "@/app/utils/gui";
import { useThree } from "@react-three/fiber";
import { EffectComposerContext } from "@react-three/postprocessing";
import { useControls } from "leva";
import { useContext, useEffect } from "react";

function EffectControls() {
    const setSize = useThree(state => state.setSize)
    const setDpr = useThree(state => state.setDpr)
    const presetReady = useGlobalStore(state => state.presetReady)
    const pr1 = usePresetStore(state => state["set pixelratio 1.0"])
    const { composer } = useContext(EffectComposerContext)

    useControls("Effects", {
        "set pixelratio 1": buildGuiItem("set pixelratio 1.0", (state) => {
            setSize(window.innerWidth, window.innerHeight)
            composer.setSize(window.innerWidth, window.innerHeight)
            setDpr(state ? 1.0 : window.devicePixelRatio)
        }),
        "enable PBR": buildGuiItem("enable PBR"),
        "show outline": buildGuiItem("show outline")
    }, { order: 1, collapsed: true }, [presetReady])

    // fix inconsistent when resize
    useEffect(() => {
        window.onresize = (e) => {
            setDpr(pr1 ? 1.0 : window.devicePixelRatio)
        }
    }, [pr1])
    return <></>
}

export default EffectControls;