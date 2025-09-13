import usePresetStore from "@/app/stores/usePresetStore"
import { CameraMode } from "@/app/types/camera"
import { useControls } from "leva"
import defaultConfig from '@/app/presets/Default_config.json';
import { useEffect } from "react";
import WithModel from "../model/helper/WithModel";

enum RunTypes {
    PLAYER_MODE,
    GAME_MODE
}

function RunMode() {
    const targetModelId = usePresetStore(state => state.targetModelId)
    const models = usePresetStore(state => state.models)
    const modelConfig = models[targetModelId]
    const runMode = modelConfig.motionNames ? RunTypes.PLAYER_MODE : RunTypes.GAME_MODE

    const [_, set] = useControls(() => ({
        "run mode": {
            value: runMode,
            options: {
                "Player mode": RunTypes.PLAYER_MODE,
                "Game mode": RunTypes.GAME_MODE
            },
            onChange: (mode, _, options) => {
                if (options.initial || !options.fromPanel) return
                if (mode == RunTypes.PLAYER_MODE) {
                    usePresetStore.setState(({ models, targetModelId }) => {
                        models[targetModelId].motionNames = defaultConfig.models.character.motionNames
                        return { models: {...models}, "camera mode": CameraMode.MOTION_FILE }
                    })
                }

                if (mode == RunTypes.GAME_MODE) {
                    usePresetStore.setState(({ models, targetModelId }) => {
                        models[targetModelId].motionNames = null
                        return { models: { ...models }, "camera mode": CameraMode.GAME_MODE }
                    })
                }
            },
            order: 0
        }
    }))

    useEffect(() => {
        set({ "run mode": runMode })
    }, [runMode])
    return <></>
}

export default WithModel(RunMode);