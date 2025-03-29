import useGlobalStore from "@/app/stores/useGlobalStore"
import usePresetStore from "@/app/stores/usePresetStore"
import { buildGuiItem, buildGuiObj } from "@/app/utils/gui"
import { useThree } from "@react-three/fiber"
import { useControls } from "leva"
import { useEffect } from "react"
import { WebGLRenderer } from "three"
import { WebGPURenderer } from "three/webgpu"
import useRenderLoop from "./useRenderLoop"

function useRenderer() {
    const setDpr = useThree(state => state.setDpr)
    const setSize = useThree(state => state.setSize)
    const size = useThree(state => state.size)
    const presetReady = useGlobalStore(state => state.presetReady)
    const pr1 = usePresetStore(state => state["set pixelratio 1.0"])

    const { isWebGPU } = useControls("Renderer", {
        "set pixelratio 1": buildGuiItem("set pixelratio 1.0", (state) => {
            setSize(window.innerWidth, window.innerHeight)
            setDpr(state ? 1.0 : window.devicePixelRatio)
        }),
        ...buildGuiObj("enable PBR"),
        ...buildGuiObj("isWebGPU")
    }, { order: 100, collapsed: true }, [presetReady])

    // change renderer
    const set = useThree(state => state.set)
    const gl = useThree(state => state.gl)
    useEffect(() => {
        const defaultProps = {
            canvas: gl.domElement,
            powerPreference: 'high-performance',
            antialias: true,
            alpha: true
        } as const

        const initWebGPU = async () => {
            const renderer = new WebGPURenderer(defaultProps as any)
            await renderer.init()
            set({ gl: renderer as any })
        }
        if (isWebGPU) {
            initWebGPU()
        } else {
            set({ gl: new WebGLRenderer(defaultProps) })
        }
    }, [isWebGPU])

    // fix inconsistent when resize
    useEffect(() => {
        setDpr(pr1 ? 1.0 : window.devicePixelRatio)
    }, [size])

    useRenderLoop()
}

export default useRenderer;