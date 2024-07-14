import { CameraMode } from "@/app/modules/MMDCameraWorkHelper"
import useGlobalStore from "@/app/stores/useGlobalStore"
import usePresetStore from "@/app/stores/usePresetStore"
import { folder, useControls } from "leva"
import { useLayoutEffect } from "react"
import useRenderLoop from "../renderLoop/useRenderLoop"
import { buildGuiHandler, buildGuiItem } from "@/app/utils/gui"

function Env() {
    const presetReady = useGlobalStore(state => state.presetReady)


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

    const fog = useControls('Light', {
        fog: folder({
            color: buildGuiItem("fog color"),
            density: {
                ...buildGuiItem("fog density"),
                min: 0,
                max: 10
            }
        }),
    }, { order: 3, collapsed: true }, [presetReady])

    const ambientLight = useControls('Light', {
        ambientLight: folder({
            color: buildGuiItem("Ambient color"),
            intensity: {
                ...buildGuiItem("Ambient intensity"),
                min: 0,
                max: 10,
            },
        })
    }, [presetReady])

    const directionalLight = useControls('Light', {
        directionalLight: folder({
            color: buildGuiItem("Directional"),
            intensity: {
                ...buildGuiItem("Directional intensity"),
                min: 0,
                max: 10
            },
            position: buildGuiItem("Directional position"),
        })
    }, [presetReady])

    useRenderLoop()
    return (
        <>
            <fogExp2 attach="fog" color={fog.color} density={fog.density}></fogExp2>
            <ambientLight color={ambientLight.color} intensity={ambientLight.intensity} />
            <directionalLight color={directionalLight.color} position={directionalLight.position} intensity={directionalLight.intensity} />
        </>
    );
}

export default Env;