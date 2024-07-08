import { CameraMode } from "@/app/modules/MMDCameraWorkHelper"
import useGlobalStore from "@/app/stores/useGlobalStore"
import usePresetStore from "@/app/stores/usePresetStore"
import { folder, useControls } from "leva"
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

    const fog = useControls('Light', {
        fog: folder({
            color: `#${fogColor.toString(16)}`,
            density: {
                value: fogDensity * 1000,
                min: 0,
                max: 10
            }
        }),
    }, { order: 3, collapsed: true })

    const ambientLight = useControls('Light', {
        ambientLight: folder({
            color: `#${ambientColor.toString(16)}`,
            intensity: {
                value: ambientIntensity,
                min: 0,
                max: 10
            },
        })
    })

    const directionalLight = useControls('Light', {
        directionalLight: folder({
            color: `#${directionalColor.toString(16)}`,
            intensity: {
                value: directionalIntensity,
                min: 0,
                max: 10
            },
            position: [lightX, lightY, lightZ]
        })
    })

    useRenderLoop()
    return (
        <>
            <fogExp2 attach="fog" color={fog.color} density={fog.density * 0.001}></fogExp2>
            <ambientLight color={ambientLight.color} intensity={ambientLight.intensity} />
            <directionalLight color={directionalLight.color} position={directionalLight.position} intensity={directionalLight.intensity} />
        </>
    );
}

export default Env;