import useGlobalStore from "@/app/stores/useGlobalStore";
import { useEffect, useRef, useState } from "react";
import AudioPlayer from "./audio-player";
import FullScreenButton from "./fullscreen-button";

function ControlBar() {
    const getPlayer = () => useGlobalStore.getState().player
    const isHoverRef = useRef(false)
    const timeoutIdRef = useRef(null)

    useEffect(() => {
        const fullScreenBt = document.getElementById("fsBtn")
        const rawPlayer = document.getElementById("rawPlayer")
        const controls = document.querySelectorAll(".control-bar")
        // control bar
        document.addEventListener('mousemove', (e) => {
            const player = getPlayer()

            rawPlayer.style.opacity = "0.5";
            fullScreenBt.style.opacity = "0.5";
            document.body.style.cursor = "default"
            if (timeoutIdRef.current !== null) {
                clearTimeout(timeoutIdRef.current);
                timeoutIdRef.current = undefined
            }

            timeoutIdRef.current = setTimeout(function () {
                if(isHoverRef.current) return
                rawPlayer.style.opacity = "0";
                fullScreenBt.style.opacity = "0";
                if (player && !player.paused) {
                    document.body.style.cursor = "none"
                }
            }, 1000);
        });
        for(const control of controls) {
            control.addEventListener('mouseenter', () => {
                isHoverRef.current = true
            })
            control.addEventListener('mouseleave', () => {
                isHoverRef.current = false
            })
        }
    }, [])
    return (
        <>
            <AudioPlayer></AudioPlayer>
            <FullScreenButton></FullScreenButton>
        </>
    );
}

export default ControlBar;