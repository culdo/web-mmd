import usePresetStore from "@/app/stores/usePresetStore"
import { useControls } from "leva"
import { useEffect } from "react";
import WithModel from "../model/helper/WithModel";
import GameMode from "./game-mode";
import { buildGuiItem } from "@/app/utils/gui";

export enum RunModes {
    PLAYER_MODE,
    GAME_MODE
}

function RunMode() {
    const runMode = usePresetStore(state => state["run mode"])

    const [_, set] = useControls(() => ({
        "run mode": {
            ...buildGuiItem("run mode"),
            options: {
                "Player mode": RunModes.PLAYER_MODE,
                "Game mode": RunModes.GAME_MODE
            },
            order: 0
        }
    }))

    useEffect(() => {
        set({ "run mode": runMode })
    }, [runMode])

    return (
        <>
            {runMode == RunModes.GAME_MODE && <GameMode></GameMode>}
        </>
    )
}

export default WithModel(RunMode);