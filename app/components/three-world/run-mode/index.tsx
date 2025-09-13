import usePresetStore from "@/app/stores/usePresetStore"
import { CameraMode } from "@/app/types/camera"
import { useControls } from "leva"
import defaultConfig from '@/app/presets/Default_config.json';

enum RunTypes {
    PLAYER_MODE,
    GAME_MODE
}

function RunMode() {
    const targetModelId = usePresetStore(state => state.targetModelId)
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
                    usePresetStore.setState(({ models }) => {
                        models[targetModelId].motionNames = defaultConfig.models.character.motionNames
                        return { models: defaultConfig.models, "camera mode": CameraMode.MOTION_FILE }
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