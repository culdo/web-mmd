import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { buildGuiItem } from "@/app/utils/gui";
import { useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect } from "react";

function EffectControls() {
    const setDpr = useThree(state => state.setDpr)
    const setSize = useThree(state => state.setSize)
    const size = useThree(state => state.size)
    const presetReady = useGlobalStore(state => state.presetReady)
    const pr1 = usePresetStore(state => state["set pixelratio 1.0"])

    useControls("Effects", {
        "set pixelratio 1": buildGuiItem("set pixelratio 1.0", (state) => {
            setSize(window.innerWidth, window.innerHeight)
            setDpr(state ? 1.0 : window.devicePixelRatio)
        }),
        "enable PBR": buildGuiItem("enable PBR"),
        "show outline": buildGuiItem("show outline")
    }, { order: 100, collapsed: true }, [presetReady])
    // fix inconsistent when resize
    useEffect(() => {
        setDpr(pr1 ? 1.0 : window.devicePixelRatio)
    }, [size])
    return <></>
}

export default EffectControls;