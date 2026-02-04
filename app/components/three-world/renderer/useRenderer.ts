import useGlobalStore from "@/app/stores/useGlobalStore"
import { buildGuiItem, buildGuiObj } from "@/app/utils/gui"
import { useControls } from "leva"
import useRenderLoop from "./useRenderLoop"
import { useThree } from "@react-three/fiber"
import { useEffect } from "react"
import { PCFShadowMap, PCFSoftShadowMap, WebGLRenderer } from "three"

function useRenderer() {
    // Temporarily fix a WebGL PCFSoftShadowMap bug in three.js r182 , which is fixed in r183.
    const renderer = useThree(state => state.gl)
    useEffect(() => {
        if (renderer instanceof WebGLRenderer && renderer.shadowMap.type == PCFSoftShadowMap) {
            renderer.shadowMap.type = PCFShadowMap
        }
    }, [renderer.shadowMap.type])
    
    useControls("Renderer", {
        "set pixelratio 1": buildGuiItem("set pixelratio 1.0"),
        ...buildGuiObj("enable PBR"),
        ...buildGuiObj("isWebGPU")
    }, { order: 100, collapsed: true })

    useRenderLoop()
}

export default useRenderer;