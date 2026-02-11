import { useControls } from "leva"
import GameMode from "./game-mode";
import { buildGuiItem } from "@/app/utils/gui";
import IntroductionMode from "./introduction-mode";

export enum RunModes {
    PLAYER_MODE,
    GAME_MODE,
    INTRO_MODE
}

const PlayerMode = () => <></>;

const runModes = [
    PlayerMode,
    GameMode,
    IntroductionMode
]

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

    const Mode = runModes[runMode % runModes.length];

    return <Mode />;
}

export default RunMode;