import useGlobalStore from "@/app/stores/useGlobalStore"
import usePresetStore from "@/app/stores/usePresetStore"
import { useEffect } from "react"

function useAutoHide(onPlay: () => void, onPause: () => void) {
    const player = useGlobalStore(states => states.player)
    const autoHideGui = usePresetStore(states => states["auto hide GUI"])

    useEffect(() => {
        if (!player || !autoHideGui) return
        player.addEventListener("play", onPlay)
        player.addEventListener("pause", onPause)
        return () => {
            player.removeEventListener("play", onPlay)
            player.removeEventListener("pause", onPause)
        }
    }, [player, autoHideGui])
}

export default useAutoHide;