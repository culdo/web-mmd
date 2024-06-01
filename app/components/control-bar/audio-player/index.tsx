import { useEffect } from "react";
import styles from "./styles.module.css"
import videojs from "video.js";
import { dataURItoBlobUrl, loadMusicFromYT } from "@/app/utils/base";
import Player from "video.js/dist/types/player";
import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";

declare global {
    interface Window { vjplayer: Player; }
}

function AudioPlayer() {
    const api = usePresetStore()
    const runtimeCharacter = useGlobalStore(state => state.runtimeCharacter)
    const gui = useGlobalStore(state => state.gui)

    const init = () => {
        // music player
        const player = videojs('rawPlayer', {
            "audioOnlyMode": true
        })
        // for testing
        window.vjplayer = player
        if (api.musicURL.startsWith("data:")) {
            player.src(dataURItoBlobUrl(api.musicURL))
        } else {
            loadMusicFromYT(api);
        }

        player.currentTime(api["currentTime"]);
        player.volume(api['volume']);

        player.on('volumechange', () => {
            api['volume'] = player.volume();
            if (player.muted()) {
                api['volume'] = 0.0;
            }
        })

        player.on('play', () => {
            runtimeCharacter.physics.reset();
            if (api["auto hide GUI"]) gui.hidden = true;
        })
        player.on('pause', () => {
            gui.hidden = false;
            api.currentTime = player.currentTime();
        })

        player.on('seeked', () => {
            api.currentTime = player.currentTime();
        })

        useGlobalStore.setState({ player })
    }

    useEffect(() => {
        if (!api || !runtimeCharacter || !gui) return
        init()
    }, [api, runtimeCharacter, gui])
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