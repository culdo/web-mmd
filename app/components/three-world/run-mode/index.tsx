import { useControls } from "leva"
import WithModel from "../model/helper/WithModel";
import GameMode from "./game-mode";
import { buildGuiItem } from "@/app/utils/gui";

export enum RunModes {
    PLAYER_MODE,
    GAME_MODE
}

function RunMode() {
    const { "run mode": runMode } = useControls({
        "run mode": {
            ...buildGuiItem("run mode"),
            options: {
                "Player mode": RunModes.PLAYER_MODE,
                "Game mode": RunModes.GAME_MODE
            },
            order: 0
        }
    })

    return (
        <>
            {runMode == RunModes.GAME_MODE && <GameMode />}
        </>
    )
}

export default WithModel(RunMode);