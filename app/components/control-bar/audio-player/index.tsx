import { LegacyRef, SyntheticEvent, use, useEffect, useRef } from "react";
import styles from "./styles.module.css"
import useGlobalStore, { Gui } from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { useControls } from "leva";

import YoutubeVideo from 'youtube-video-element/react';
import 'media-chrome/react';
import 'media-chrome/react/menu';
import { MediaTheme } from 'media-chrome/react/media-theme';
import CustomVideoElement from "youtube-video-element";

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

    const [gui, setMusicGui] = useControls('MMD Files', () => ({
        music: {
            value: musicName,
            editable: false
        },
        ytUrl: {
            label: "YT URL",
            value: musicYtURL
        },
    }), { order: 2, collapsed: true }, [musicName])

    const ytPlayer = useRef<CustomVideoElement>()

    const onPlay = (e: SyntheticEvent<HTMLVideoElement, Event>) => {
        if (autoHideGui) setGui({ hidden: true });
        useGlobalStore.setState({ enabledTransform: false })
    }

    const onPause = (e: SyntheticEvent<HTMLVideoElement, Event>) => {
        setGui({ hidden: false });
        setTime(ytPlayer.current.currentTime);
        useGlobalStore.setState({ enabledTransform: true })
    }

    const onSeeked = (e: SyntheticEvent<HTMLVideoElement, Event>) => {
        setTime(ytPlayer.current.currentTime);
        useGlobalStore.setState({ enabledTransform: true })
    }

    const onLoadedMetadata = (e: SyntheticEvent<HTMLVideoElement, Event>) => {
        ytPlayer.current.currentTime = currentTime
        useGlobalStore.setState({ player: ytPlayer.current})
        const musicName = ytPlayer.current.title
        usePresetStore.setState({ musicName })
        setMusicGui({ music: musicName })
    }

    return (
        <>
            <template
                id="media-theme-audio"
                dangerouslySetInnerHTML={{
                    __html: `
                        <media-controller audio>
                            <slot name="media" slot="media"></slot>
                            <media-control-bar style="width: 100%;">
                                <media-play-button></media-play-button>
                                <media-mute-button></media-mute-button>
                                <media-volume-range></media-volume-range>
                                <media-time-range></media-time-range>
                                <media-time-display showduration></media-time-display>
                            </media-control-bar>
                        </media-controller>` }}
            />

            <MediaTheme
                id="rawPlayer"
                template="media-theme-audio" 
                className={styles.player}
            >
                <YoutubeVideo
                    ref={ytPlayer}
                    slot="media"
                    src={gui.ytUrl}
                    onPlay={onPlay}
                    onPause={onPause}
                    onSeeked={onSeeked}
                    onLoadedMetadata={onLoadedMetadata}
                ></YoutubeVideo>
            </MediaTheme>
        </>
    );
}

export default AudioPlayer;