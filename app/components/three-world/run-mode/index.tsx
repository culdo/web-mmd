import usePresetStore from "@/app/stores/usePresetStore"
import { CameraMode } from "@/app/types/camera"
import { useControls } from "leva"
import defaultConfig from '@/app/presets/Default_config.json';
import { useEffect, useRef } from "react";
import WithModel from "../model/helper/WithModel";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { useFrame } from "@react-three/fiber";
import { Material } from "three";

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
                        models[targetModelId].motionNames = defaultConfig.models[targetModelId as "character"]?.motionNames ?? []
                        return { models: { ...models }, "camera mode": CameraMode.MOTION_FILE }
                    })
                }

                if (mode == RunTypes.GAME_MODE) {
                    usePresetStore.setState(({ models, targetModelId }) => {
                        models[targetModelId].motionNames = null
                        return { models: { ...models }, "camera mode": CameraMode.GAME_MODE }
                    })
                    useGlobalStore.setState({ gui: { hidden: true }, showGameMenu: true })
                    document.getElementById("rawPlayer").style.display = "none"
                }
            },
            order: 0
        }
    }))

    useEffect(() => {
        set({ "run mode": runMode })
    }, [runMode])

    const runTimeModels = useGlobalStore(state => state.models)
    const showGameMenu = useGlobalStore(state => state.showGameMenu)
    const isShowingGameMenu = useRef(false)

    useEffect(() => {
        isShowingGameMenu.current = true
    }, [showGameMenu])
    
    useFrame((_, delta) => {
        const { stage } = runTimeModels
        if (!stage || !isShowingGameMenu.current) {}
        const opacityDelta = showGameMenu ? -2 : 2
        for (const material of stage.material as Material[]) {
            material.opacity += opacityDelta * delta
            if (material.opacity > 1) {
                material.opacity = 1
                isShowingGameMenu.current = false
            }
            if (material.opacity < 0) {
                material.opacity = 0
                isShowingGameMenu.current = false
            }
        }
    })
    return <></>
}

export default WithModel(RunMode);