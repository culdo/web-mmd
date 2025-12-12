import { useControls } from "leva"
import WithModel from "../model/helper/WithModel";
import GameMode from "./game-mode";
import { buildGuiItem } from "@/app/utils/gui";
import IntroductionMode from "./introduction-mode";

export enum RunModes {
    PLAYER_MODE,
    GAME_MODE,
    INTRO_MODE
}

function RunMode() {
    const { "run mode": runMode } = useControls({
        "run mode": {
            ...buildGuiItem("run mode"),
            options: {
                "Player mode": RunModes.PLAYER_MODE,
                "Game mode": RunModes.GAME_MODE,
                "Intro mode": RunModes.INTRO_MODE,
            },
            order: 0
        }
    })

    return (
        <>
            {runMode == RunModes.GAME_MODE && <GameMode />}
            {runMode == RunModes.INTRO_MODE && <IntroductionMode />}
        </>
    )
}

export default WithModel(RunMode);