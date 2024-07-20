import useGlobalStore from "@/app/stores/useGlobalStore"
import { buildGuiItem } from "@/app/utils/gui"
import { button, folder, useControls } from "leva"
import { useEffect, useLayoutEffect, useState } from "react"
import useRenderLoop from "../renderLoop/useRenderLoop"
import DirectionalLight from "./DirectionalLight"
import usePresetStore from "@/app/stores/usePresetStore"
import { randomBytes } from "crypto"
import defaultConfig from '@/app/configs/Default_config.json';

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

    const dirLights = usePresetStore(states => states.Light)

    useControls('Light', {
        "Add Directional Light": button(() => {
            usePresetStore.setState(({ Light }) => {
                const newLightName = `directionalLight-${randomBytes(3).toString('base64')}`
                const defaultName = "Light.directionalLight"
                // init default value
                const states = {
                    color: defaultConfig[`${defaultName}.color`],
                    intensity: defaultConfig[`${defaultName}.intensity`],
                    position: defaultConfig[`${defaultName}.position`]
                }
                return { Light: { ...Light, [newLightName]: states } }
            })
        })
    })

    useRenderLoop()
    return (
        <>
            <fogExp2 attach="fog" color={fog.color} density={fog.density}></fogExp2>
            <ambientLight color={ambientLight.color} intensity={ambientLight.intensity} />
            {
                Object.entries(dirLights).map(([name, _]) => <DirectionalLight key={name} name={name}></DirectionalLight>)
            }
        </>
    );
}

export default Env;