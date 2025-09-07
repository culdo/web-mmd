import { SyntheticEvent, useEffect, useRef, useState } from "react";
import styles from "./styles.module.css"
import useGlobalStore, { Gui } from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { useControls } from "leva";

import YoutubeVideo from 'youtube-video-element/react';
import 'media-chrome/react';
import 'media-chrome/react/menu';
import CustomVideoElement from "youtube-video-element";
import { buildGuiItem, buildGuiObj } from "@/app/utils/gui";
import { getProject } from "@theatre/core";
import { CameraMode } from "@/app/types/camera";
import { MediaControlBar, MediaController, MediaMuteButton, MediaPlayButton, MediaTimeDisplay, MediaTimeRange, MediaVolumeRange } from "media-chrome/react";

function AudioPlayer() {
    const setCurrentTime = (currentTime: number) => usePresetStore.setState({ currentTime })

    const currentTime = usePresetStore(state => state.currentTime)
    const musicName = usePresetStore(state => state.musicName)

    const autoHideGui = usePresetStore(state => state["auto hide GUI"])
    const cameraMode = usePresetStore(state => state["camera mode"])
    const setGui = (gui: Partial<Gui>) => useGlobalStore.setState({ gui })
    const presetReady = useGlobalStore(state => state.presetReady)
    const studio = useGlobalStore(state => state.theatreStudio)

    const [mute, setMute] = useState(true)

    useControls(() => ({
        ...buildGuiObj("auto hide GUI", { order: 1 })
    }))

    const [gui, setMusicGui] = useControls('Music', () => ({
        name: {
            value: musicName,
            editable: false
        },
        ytUrl: {
            label: "YT URL",
            ...buildGuiItem("musicYtURL")
        },
    }), { order: 200, collapsed: true }, [musicName])

    const ytPlayer = useRef<CustomVideoElement & {
        api: YT.Player & {
            videoTitle: string
        }
    }>()

    const onPlay = (e: SyntheticEvent<HTMLVideoElement, Event>) => {
        if (!loadedRef.current) return
        if (autoHideGui) {
            setGui({ hidden: true })

            // editor mode
            studio?.ui.hide()
        };
        useGlobalStore.setState({ showCredits: false })
        useGlobalStore.setState({ enabledTransform: false })
    }

    const onPause = (e: SyntheticEvent<HTMLVideoElement, Event>) => {
        if (!loadedRef.current) {
            if (currentTime == 0.0) {
                ytPlayer.current.currentTime = 0.0
            }
            setMute(false)
            loadedRef.current = true
            return
        }
        setGui({ hidden: false });

        // editor mode
        if (cameraMode == CameraMode.EDITOR) {
            studio.ui.restore()
        }

        setCurrentTime(ytPlayer.current.currentTime);
        useGlobalStore.setState({ enabledTransform: true })
    }

    const onSeeked = (e: SyntheticEvent<HTMLVideoElement, Event>) => {
        if (!ytPlayer.current.paused) return
        if (cameraMode == CameraMode.EDITOR) {
            const sequence = getProject("MMD").sheet("MMD UI").sequence
            sequence.position = ytPlayer.current.currentTime
        }
    }

    const loadedRef = useRef(false)
    const onLoadedMetadata = (e: SyntheticEvent<HTMLVideoElement, Event>) => {
        loadedRef.current = false
        if (currentTime == 0.0) {
            // Weird bug, which need to jump out of buffered range to avoid initial volume too loud
            ytPlayer.current.currentTime = ytPlayer.current.duration
        } else {
            ytPlayer.current.currentTime = currentTime
        }
        useGlobalStore.setState({ player: ytPlayer.current })
        const musicName = ytPlayer.current.api.videoTitle
        setMusicGui({ name: musicName })
    }

    // keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const player = ytPlayer.current
            if (!player) return
            if (e.key == " ") {
                e.stopPropagation()
                if (player.paused) {
                    player.play()
                } else {
                    player.pause()
                }
            }
            if (e.key == ".") {
                e.stopPropagation()
                player.currentTime += 1 / 30
            }
            if (e.key == ",") {
                e.stopPropagation()
                player.currentTime -= 1 / 30
            }
        }
        document.addEventListener("keydown", handler)
        return () => document.removeEventListener("keydown", handler)
    }, [])

    // seek to saved time when change preset
    useEffect(() => {
        if (!presetReady || !loadedRef.current) return
        ytPlayer.current.currentTime = currentTime
    }, [presetReady])

    return (
        <>
            <MediaController id="rawPlayer" className={`${styles.player} control-bar`} audio>
                <YoutubeVideo
                    ref={ytPlayer}
                    slot="media"
                    src={gui.ytUrl}
                    onPlay={onPlay}
                    onPause={onPause}
                    onSeeked={onSeeked}
                    onLoadedMetadata={onLoadedMetadata}
                    muted={mute}
                ></YoutubeVideo>
                <MediaControlBar style={{
                    width: "100%"
                }}>
                    <MediaPlayButton disabled></MediaPlayButton>
                    <style>
                        {`

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
                        }`
                        }
                    </style>
                    <MediaMuteButton />
                    <MediaVolumeRange />
                    <MediaTimeRange />
                    <MediaTimeDisplay showDuration />
                </MediaControlBar>
            </MediaController>
        </>
    );
}

export default AudioPlayer;