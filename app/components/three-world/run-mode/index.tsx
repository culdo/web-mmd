import usePresetStore from "@/app/stores/usePresetStore"
import WithReady from "@/app/stores/WithReady"
import { CameraMode } from "@/app/types/camera"
import { useControls } from "leva"
import { useRef } from "react"

enum RunTypes {
    PLAYER_MODE,
    GAME_MODE
}

function RunMode() {
    const targetModelId = usePresetStore(state => state.targetModelId)
    const prevMotionsRef = useRef<string[]>()
    const prevCameraModeRef = useRef<number>()
    useControls({
        "run mode": {
            value: RunTypes.PLAYER_MODE,
            options: {
                "Player mode": RunTypes.PLAYER_MODE,
                "Game mode": RunTypes.GAME_MODE
            },
            onChange: (mode, _, options) => {
                if(options.initial) return
                if (mode == RunTypes.PLAYER_MODE) {
                    if (!prevMotionsRef.current) {
                        const { models, "camera mode": cameraMode } = usePresetStore.getState()
                        prevMotionsRef.current = [...models[targetModelId].motionNames]
                        prevCameraModeRef.current = cameraMode
                        return
                    }
                    usePresetStore.setState(({ models }) => {
                        models[targetModelId].motionNames = prevMotionsRef.current
                        return { models: { ...models }, "camera mode": prevCameraModeRef.current }
                    })
                }

                if (mode == RunTypes.GAME_MODE) {
                    usePresetStore.setState(({ models }) => {
                        models[targetModelId].motionNames = []
                        return { models: { ...models }, "camera mode": CameraMode.GAME_MODE }
                    })
                }
            },
            order: 0
        }
    })
    return <></>
}

export default RunMode;