import useGlobalStore from "@/app/stores/useGlobalStore";
import { useEffect, useState } from "react";
import AudioPlayer from "./audio-player";
import FullScreenButton from "./fullscreen-button";

function ControlBar() {
    const getPlayer = () => useGlobalStore.getState().player
    const gui = useGlobalStore(state => state.gui)

    useEffect(() => {
        const fullScreenBt = document.getElementById("fsBtn")
        const rawPlayer = document.getElementById("rawPlayer")
        // control bar
        document.addEventListener('mousemove', (e) => {
            const player = getPlayer()

            rawPlayer.style.opacity = "0.5";
            fullScreenBt.style.opacity = "0.5";
            document.body.style.cursor = "default"
            if (gui._timeoutID !== undefined) {
                clearTimeout(gui._timeoutID);
                gui._timeoutID = undefined
            }

            gui._timeoutID = setTimeout(function () {
                rawPlayer.style.opacity = "0";
                fullScreenBt.style.opacity = "0";
                if (player && !player.paused()) {
                    document.body.style.cursor = "none"
                }
            }, 1000);
        });
    }, [])
    return (
        <>
            <AudioPlayer></AudioPlayer>
            <FullScreenButton></FullScreenButton>
        </>
    );
}

export default ControlBar;