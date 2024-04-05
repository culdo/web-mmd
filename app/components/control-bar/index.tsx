import useGlobalStore from "@/app/stores/useGlobalStore";
import { useEffect } from "react";
import AudioPlayer from "./audio-player";
import FullScreenButton from "./fullscreen-button";

function ControlBar() {
    const {player, gui}  = useGlobalStore((s) => (
        {
            player: s.player,
            gui: s.gui
        }
    ))

    useEffect(() => {
        if(!player || !gui) return

        const fullScreenBt = document.getElementById("fsBtn")
        const rawPlayer = document.getElementById("rawPlayer")
        // control bar
        document.addEventListener('mousemove', (e) => {

            rawPlayer.style.opacity = "0.5";
            fullScreenBt.style.opacity = "0.5";
            document.body.style.cursor = "default"
            if (gui._timeoutID !== undefined) {
                clearTimeout(gui._timeoutID);
            }

            gui._timeoutID = setTimeout(function () {
                rawPlayer.style.opacity = "0";
                fullScreenBt.style.opacity = "0";
                if (!player.paused()) {
                    document.body.style.cursor = "none"
                }
            }, 1000);
        });
    }, [player, gui])
    return (
        <>
            <AudioPlayer></AudioPlayer>
            <FullScreenButton></FullScreenButton>
        </>
    );
}

export default ControlBar;