import { useEffect } from "react";
import Actions from "./Actions";
import useMenuTransit from "./useShowingMenu";
import usePresetStore from "@/app/stores/usePresetStore";
import { CameraMode } from "@/app/types/camera";
import useGlobalStore from "@/app/stores/useGlobalStore";
import Camera from "./Camera";

function GameMode() {
    useEffect(() => {
        const { "camera mode": prevCameraMode } = usePresetStore.getState()
        usePresetStore.setState({
            "camera mode": CameraMode.FIXED_FOLLOW
        })
        useGlobalStore.setState({ gui: { hidden: true }, showGameMenu: true })
        document.getElementById("rawPlayer").style.display = "none"

        return () => {
            usePresetStore.setState({
                "camera mode": prevCameraMode
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
        </>
    );
}

export default GameMode;