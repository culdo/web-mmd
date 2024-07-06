import { CameraMode } from "@/app/modules/MMDCameraWorkHelper"
import useGlobalStore from "@/app/stores/useGlobalStore"
import usePresetStore from "@/app/stores/usePresetStore"
import { useControls } from "leva"
import { useLayoutEffect } from "react"
import useRenderLoop from "../renderLoop/useRenderLoop"

function Env() {
    const fogColor = usePresetStore(state => state["fog color"])
    const fogDensity = usePresetStore(state => state["fog density"])

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
            <ambientLight intensity={Math.PI / 2} />
            <directionalLight position={[-10, -10, -10]} intensity={Math.PI} />
        </>
    );
}

export default Env;