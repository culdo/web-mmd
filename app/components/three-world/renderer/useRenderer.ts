import useGlobalStore from "@/app/stores/useGlobalStore"
import { buildGuiObj } from "@/app/utils/gui"
import { useControls } from "leva"
import useRenderLoop from "./useRenderLoop"

function useRenderer() {
    const presetReady = useGlobalStore(state => state.presetReady)

    useControls("Renderer", {
        ...buildGuiObj("set pixelratio 1.0"),
        ...buildGuiObj("enable PBR"),
        ...buildGuiObj("isWebGPU")
    }, { order: 100, collapsed: true }, [presetReady])

    useRenderLoop()
}

export default useRenderer;