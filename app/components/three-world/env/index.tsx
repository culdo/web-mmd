import { CameraMode } from "@/app/modules/MMDCameraWorkHelper"
import useGlobalStore from "@/app/stores/useGlobalStore"
import usePresetStore from "@/app/stores/usePresetStore"
import { useControls } from "leva"
import { useLayoutEffect } from "react"
import useRenderLoop from "../renderLoop/useRenderLoop"

function Env() {
    const fogColor = usePresetStore(state => state["fog color"])
    const fogDensity = usePresetStore(state => state["fog density"])

    const ambientIntensity = usePresetStore(state => state["Ambient intensity"])
    const ambientColor = usePresetStore(state => state["Ambient color"])

    const lightX = usePresetStore(state => state.lightX)
    const lightY = usePresetStore(state => state.lightY)
    const lightZ = usePresetStore(state => state.lightZ)
    const directionalColor = usePresetStore(state => state.Directional)
    const directionalIntensity = usePresetStore(state => state["Directional intensity"])

    useLayoutEffect(() => {
        // keyboard shortcuts
        document.addEventListener("keydown", (e) => {
            if (e.key == " ") {
                const player = useGlobalStore.getState().player

                if (player?.paused()) {
                    player?.play()
                } else {
                    player?.pause()
                }
            } 
        })
    }, [])

    useRenderLoop()
    return (
        <>
            <fogExp2 attach="fog" color={fogColor} density={fogDensity}></fogExp2>
            <ambientLight color={ambientColor} intensity={ambientIntensity} />
            <directionalLight color={directionalColor} position={[lightX, lightY, lightZ]} intensity={directionalIntensity} />
        </>
    );
}

export default Env;