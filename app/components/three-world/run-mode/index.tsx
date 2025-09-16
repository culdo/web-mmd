import usePresetStore from "@/app/stores/usePresetStore"
import { CameraMode } from "@/app/types/camera"
import { useControls } from "leva"
import defaultConfig from '@/app/presets/Default_config.json';
import { useEffect, useRef } from "react";
import WithModel from "../model/helper/WithModel";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { useFrame } from "@react-three/fiber";
import { Material } from "three";

export enum RunModes {
    PLAYER_MODE,
    GAME_MODE
}

function RunMode() {
    const runMode = usePresetStore(state => state["run mode"])

    const [_, set] = useControls(() => ({
        "run mode": {
            value: runMode,
            options: {
                "Player mode": RunModes.PLAYER_MODE,
                "Game mode": RunModes.GAME_MODE
            },
            onChange: (mode, _, options) => {
                if (options.initial || !options.fromPanel) return
                if (mode == RunModes.PLAYER_MODE) {
                    usePresetStore.setState({
                        "run mode": RunModes.PLAYER_MODE,
                        "camera mode": CameraMode.MOTION_FILE
                    })
                }

                if (mode == RunModes.GAME_MODE) {
                    usePresetStore.setState({
                        "run mode": RunModes.GAME_MODE,
                        "camera mode": CameraMode.FIXED_FOLLOW
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
        if (!stage || !isShowingGameMenu.current) return
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