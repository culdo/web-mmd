import { useEffect } from "react";
import styles from "./styles.module.css"
import videojs from "video.js";
import { dataURItoBlobUrl, loadMusicFromYT } from "@/app/utils/base";
import Player from "video.js/dist/types/player";
import useGlobalStore, { Gui } from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { button, useControls } from "leva";

declare global {
    interface Window { vjplayer: Player; }
}

function AudioPlayer() {

    const setVolume = (volume: number) => usePresetStore.setState({ volume })
    const setTime = (currentTime: number) => usePresetStore.setState({ currentTime })

    const currentTime = usePresetStore(state => state.currentTime)
    const volume = usePresetStore(state => state.volume)
    const musicName = usePresetStore(state => state.musicName)
    const musicURL = usePresetStore(state => state.musicURL)
    const musicYtURL = usePresetStore(state => state.musicYtURL)

    const autoHideGui = usePresetStore(state => state["auto hide GUI"])

    const setGui = (gui: Partial<Gui>) => useGlobalStore.setState({ gui })

    const [_, setMusicGui] = useControls('MMD Files', () => ({
        music: {
            value: musicName,
            editable: false
        },
        "YT Url": {
            value: musicYtURL,
            onChange: (value, path, context) => {
                if (!context.initial) {
                    loadMusicFromYT({currentTime, volume, musicYtURL: value})
                }
            },
        },
    }), { order: 2, collapsed: true }, [musicName])

    const init = async () => {
        // music player
        const player = videojs('rawPlayer', {
            "audioOnlyMode": true
        })
        // for testing
        window.vjplayer = player
        if (musicURL.startsWith("data:")) {
            player.src(dataURItoBlobUrl(musicURL))
        } else {
            await loadMusicFromYT({currentTime, volume, musicYtURL});
        }

        player.currentTime(currentTime);
        player.volume(volume);
        
        player.on('durationchange', () => {
            const musicName = (player.tech(true) as any).ytPlayer.videoTitle
            usePresetStore.setState({ musicName })
            setMusicGui({ music: musicName })
        })
        player.on('volumechange', () => {
            setVolume(player.volume());
            if (player.muted()) {
                setVolume(0.0);
            }
        })

        player.on('play', () => {
            if (autoHideGui) setGui({ hidden: true });
        })
        player.on('pause', () => {
            setGui({ hidden: false });
            setTime(player.currentTime());
        })

        player.on('seeked', () => {
            setTime(player.currentTime());
        })

        useGlobalStore.setState({ player })
    }

    useEffect(() => {
        init()
    }, [])
    return (
        <audio
            id="rawPlayer"
            className={`video-js vjs-default-skin ${styles.player}`}
            controls
        >
        </audio>
    );
}

export default AudioPlayer;