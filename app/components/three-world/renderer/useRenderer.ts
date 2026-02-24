import { buildGuiItem, buildGuiObj } from "@/app/utils/gui"
import { useControls } from "leva"
import useRenderLoop from "./useRenderLoop"

function useRenderer() {
    useControls("Renderer", {
        "set pixelratio 1": buildGuiItem("set pixelratio 1.0"),
        ...buildGuiObj("enable PBR"),
        ...buildGuiObj("isWebGPU")
    }, { order: 100, collapsed: true })

    useRenderLoop()
}

export default useRenderer;