import { SyntheticEvent, useRef } from "react";
import styles from "./styles.module.css"
import useGlobalStore, { Gui } from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { useControls } from "leva";

import YoutubeVideo from 'youtube-video-element/react';
import 'media-chrome/react';
import 'media-chrome/react/menu';
import { MediaTheme } from 'media-chrome/react/media-theme';
import CustomVideoElement from "youtube-video-element";
import { buildGuiItem } from "@/app/utils/gui";

function AudioPlayer() {
    const setCurrentTime = (currentTime: number) => usePresetStore.setState({ currentTime })

    const currentTime = usePresetStore(state => state.currentTime)
    const musicName = usePresetStore(state => state.musicName)

    const autoHideGui = usePresetStore(state => state["auto hide GUI"])
    const setGui = (gui: Partial<Gui>) => useGlobalStore.setState({ gui })

    const [gui, setMusicGui] = useControls('Music', () => ({
        name: {
            value: musicName,
            editable: false
        },
        ytUrl: {
            label: "YT URL",
            ...buildGuiItem("musicYtURL")
        },
    }), { order: 2, collapsed: true }, [musicName])

    const ytPlayer = useRef<CustomVideoElement & { 
        api: YT.Player & {
            videoTitle: string
        }
    }>()

    const onPlay = (e: SyntheticEvent<HTMLVideoElement, Event>) => {
        console.log("onPlay")
        if(!loadedRef.current) return
        if (autoHideGui) setGui({ hidden: true });
        useGlobalStore.setState({ enabledTransform: false })
    }

    const onPause = (e: SyntheticEvent<HTMLVideoElement, Event>) => {
        console.log("onPause")
        if(!loadedRef.current) {
            if(currentTime == 0.0) {
                ytPlayer.current.currentTime = 0.0
            }
            ytPlayer.current.api.unMute()
            loadedRef.current = true
            return
        }
        setGui({ hidden: false });
        setCurrentTime(ytPlayer.current.currentTime);
        useGlobalStore.setState({ enabledTransform: true })
    }

    const lastTimeRef = useRef(currentTime)
    const onSeeked = (e: SyntheticEvent<HTMLVideoElement, Event>) => {
        if(!loadedRef.current) return
        if(Math.abs(ytPlayer.current.currentTime - lastTimeRef.current) > 1.0) {
            setCurrentTime(ytPlayer.current.currentTime);
        }
        lastTimeRef.current = ytPlayer.current.currentTime
    }

    const loadedRef = useRef(false)
    const onLoadedMetadata = (e: SyntheticEvent<HTMLVideoElement, Event>) => {
        loadedRef.current = false
        if(currentTime == 0.0) {
            ytPlayer.current.currentTime = 1.0
        } else {
            ytPlayer.current.currentTime = currentTime
        }
        useGlobalStore.setState({ player: ytPlayer.current })
        const musicName = ytPlayer.current.api.videoTitle
        setMusicGui({ name: musicName })
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
                                <media-play-button disabled></media-play-button>
                                <style>
                                    media-mute-button + media-volume-range {
                                        width: 0;
                                        overflow: hidden;
                                        transition: width 0.2s ease-in;
                                    }

                                    /* Expand volume control in all relevant states */
                                    media-mute-button:hover + media-volume-range,
                                    media-mute-button:focus + media-volume-range,
                                    media-mute-button:focus-within + media-volume-range,
                                    media-volume-range:hover,
                                    media-volume-range:focus,
                                    media-volume-range:focus-within {
                                        width: 70px;
                                    }
                                </style>
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
                    muted
                ></YoutubeVideo>
            </MediaTheme>
        </>
    );
}

export default AudioPlayer;