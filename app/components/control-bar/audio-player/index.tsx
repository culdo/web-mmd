import { SyntheticEvent, useEffect, useRef } from "react";
import styles from "./styles.module.css"
import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { button, useControls } from "leva";

import 'media-chrome/react';
import 'media-chrome/react/menu';
import { buildGuiItem, loadFile } from "@/app/utils/gui";
import { getProject } from "@theatre/core";
import { CameraMode } from "@/app/types/camera";
import { MediaControlBar, MediaController, MediaMuteButton, MediaPlayButton, MediaTimeDisplay, MediaTimeRange, MediaVolumeRange } from "media-chrome/react";
import { RunModes } from "../../three-world/run-modes";
import useConfigStore from "@/app/stores/useConfigStore";
import Musics from "../../main-ui/musics";

function AudioPlayer() {
    const setCurrentTime = (currentTime: number) => usePresetStore.setState({ currentTime })

    const currentTime = usePresetStore(state => state.currentTime)
    const musicName = usePresetStore(state => state.musicName)

    const audioFile = useConfigStore(state => state.audioFiles)?.[musicName]
    const cameraMode = usePresetStore(state => state["camera mode"])
    const runMode = usePresetStore(state => state["run mode"])

    useControls('Music', () => ({
        name: {
            ...buildGuiItem("musicName"),
            editable: false
        },
        "select audio file": button(() => {
            Musics.onCreate()
        }),
        "auto hide GUI on playing": buildGuiItem("auto hide GUI")
    }), { order: 200, collapsed: true }, [musicName])

    const playerRef = useRef<HTMLVideoElement>()

    const onPlay = (e: SyntheticEvent<HTMLVideoElement, Event>) => {
        useGlobalStore.setState({ creditsPose: null })
        useGlobalStore.setState({ enabledTransform: false })
    }

    const onPause = (e: SyntheticEvent<HTMLVideoElement, Event>) => {
        setCurrentTime(playerRef.current.currentTime);
        useGlobalStore.setState({ enabledTransform: true })
    }

    const onSeeked = (e: SyntheticEvent<HTMLVideoElement, Event>) => {
        if (!playerRef.current.paused) return
        if (cameraMode == CameraMode.EDITOR) {
            const sequence = getProject("MMD").sheet("MMD UI").sequence
            sequence.position = playerRef.current.currentTime
        }
    }

    const onLoaded = (player: HTMLVideoElement) => {
        playerRef.current = player;
        useGlobalStore.setState({ player })
    }

    // keyboard shortcuts
    useEffect(() => {
        if (runMode == RunModes.GAME_MODE) return
        const handler = (e: KeyboardEvent) => {
            const player = playerRef.current
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
        document.addEventListener("keyup", handler)
        return () => document.removeEventListener("keyup", handler)
    }, [runMode])

    // load saved time when preset changed
    useEffect(() => {
        if (playerRef.current.currentTime == currentTime) return
        playerRef.current.currentTime = currentTime
    }, [currentTime])

    useEffect(() => {
        if (!audioFile) {
            playerRef.current.removeAttribute("src")
            playerRef.current.src = ""
        }
    }, [audioFile])

    return (
        <MediaController id="rawPlayer" className={`${styles.player} control-bar`} audio>
            <audio
                ref={onLoaded}
                slot="media"
                src={audioFile}
                onPlay={onPlay}
                onPause={onPause}
                onSeeked={onSeeked}
            ></audio>
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
    );
}

export default AudioPlayer;