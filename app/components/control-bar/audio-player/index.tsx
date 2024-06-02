import { useEffect } from "react";
import styles from "./styles.module.css"
import videojs from "video.js";
import { dataURItoBlobUrl, loadMusicFromYT } from "@/app/utils/base";
import Player from "video.js/dist/types/player";
import useGlobalStore, { Gui } from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";

declare global {
    interface Window { vjplayer: Player; }
}

function AudioPlayer() {
    const api = usePresetStore()
    const setVolume = (volume: number) => usePresetStore.setState({ volume })
    const setTime = (currentTime: number) => usePresetStore.setState({ currentTime })

    const getRuntimeCharacter = () => useGlobalStore.getState().runtimeCharacter
    const setGui = (gui: Partial<Gui>) => useGlobalStore.setState({ gui })

    const init = async () => {
        // music player
        const player = videojs('rawPlayer', {
            "audioOnlyMode": true
        })
        // for testing
        window.vjplayer = player
        if (api.musicURL.startsWith("data:")) {
            player.src(dataURItoBlobUrl(api.musicURL))
        } else {
            await loadMusicFromYT(api);
        }
        
        player.currentTime(api.currentTime);
        player.volume(api.volume);
        
        player.on('volumechange', () => {
            setVolume(player.volume());
            if (player.muted()) {
                setVolume(0.0);
            }
        })

        player.on('play', () => {
            getRuntimeCharacter().physics.reset();
            if (api["auto hide GUI"]) setGui({ hidden: true });
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
        if(!api.pmxFiles) return
        init()
    }, [api.pmxFiles])
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