import useGlobalStore from "@/app/stores/useGlobalStore";
import { useEffect, useRef, useState } from "react";
import AudioPlayer from "./audio-player";
import FullScreenButton from "./fullscreen-button";
import usePresetStore from "@/app/stores/usePresetStore";
import { CameraMode } from "@/app/types/camera";

function ControlBar() {
    const getPlayer = () => useGlobalStore.getState().player
    const isHoverRef = useRef(false)
    const timeoutIdRef = useRef(null)

    useEffect(() => {
        const fullScreenBt = document.getElementById("fsBtn")
        const rawPlayer = document.getElementById("rawPlayer")
        const controls = document.querySelectorAll(".control-bar")
        // control bar
        const onMousemove = () => {
            const player = getPlayer()

            rawPlayer.style.opacity = "0.5";
            fullScreenBt.style.opacity = "0.5";
            if (usePresetStore.getState()["camera mode"] != CameraMode.DJ) {
                document.body.style.cursor = "default"
            }
            if (timeoutIdRef.current !== null) {
                clearTimeout(timeoutIdRef.current);
                timeoutIdRef.current = undefined
            }

            timeoutIdRef.current = setTimeout(function () {
                if (isHoverRef.current) return
                rawPlayer.style.opacity = "0";
                fullScreenBt.style.opacity = "0";
                if (player && !player.paused) {
                    document.body.style.cursor = "none"
                }
            }, 1000);
        }
        const onMouseenter = () => {
            isHoverRef.current = true
        }
        const onMouseleave = () => {
            isHoverRef.current = false
        }
        document.addEventListener('mousemove', onMousemove);
        for (const control of controls) {
            control.addEventListener('mouseenter', onMouseenter)
            control.addEventListener('mouseleave', onMouseleave)
        }
        return () => {
            document.removeEventListener('mousemove', onMousemove);
            for (const control of controls) {
                control.removeEventListener('mouseenter', onMouseenter)
                control.removeEventListener('mouseleave', onMouseleave)
            }
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