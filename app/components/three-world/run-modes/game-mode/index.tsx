import { useEffect } from "react";
import Actions from "./Actions";
import useMenuTransit from "./useShowingMenu";
import usePresetStore from "@/app/stores/usePresetStore";
import { CameraMode } from "@/app/types/camera";
import useGlobalStore from "@/app/stores/useGlobalStore";
import Camera from "./Camera";
import Room from "./room";

function GameMode() {
    useEffect(() => {
        usePresetStore.setState({
            "camera mode": CameraMode.FIX_FOLLOWING,
            enableMultiPlayer: true
        })
        useGlobalStore.setState({ gui: { hidden: true }, showGameMenu: false })
        document.getElementById("rawPlayer").style.display = "none"

        return () => {
            usePresetStore.setState({
                "camera mode": CameraMode.MOTION_FILE,
                enableMultiPlayer: false
            })
            useGlobalStore.setState({ gui: { hidden: false }, showGameMenu: true })
            document.getElementById("rawPlayer").style.display = "block"
        }
    }, [])
    useMenuTransit()
    return (
        <>
            <Actions></Actions>
            <Camera></Camera>
            <Room></Room>
        </>
    );
}

export default GameMode;