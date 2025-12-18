import { SyntheticEvent, useEffect, useRef, useState } from "react";
import styles from "./styles.module.css"
import useGlobalStore, { Gui } from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { button, useControls } from "leva";

import 'media-chrome/react';
import 'media-chrome/react/menu';
import { buildGuiItem, buildGuiObj, loadFile } from "@/app/utils/gui";
import { getProject } from "@theatre/core";
import { CameraMode } from "@/app/types/camera";
import { MediaControlBar, MediaController, MediaMuteButton, MediaPlayButton, MediaTimeDisplay, MediaTimeRange, MediaVolumeRange } from "media-chrome/react";
import { RunModes } from "../../three-world/run-modes";

function AudioPlayer() {
    const setCurrentTime = (currentTime: number) => usePresetStore.setState({ currentTime })

    const currentTime = usePresetStore(state => state.currentTime)
    const musicName = usePresetStore(state => state.musicName)

    const audioFile = usePresetStore(state => state.audioFile)
    const autoHideGui = usePresetStore(state => state["auto hide GUI"])
    const cameraMode = usePresetStore(state => state["camera mode"])
    const runMode = usePresetStore(state => state["run mode"])
    const setGui = (gui: Partial<Gui>) => useGlobalStore.setState({ gui })
    const presetReady = useGlobalStore(state => state.presetReady)
    const studio = useGlobalStore(state => state.theatreStudio)

    useControls(() => ({
        ...buildGuiObj("auto hide GUI", { order: 2 })
    }))

    useControls('Music', () => ({
        name: {
            ...buildGuiItem("musicName"),
            editable: false
        },
        "select audio file": button(() => {
            loadFile((audioFile, musicName) => {
                usePresetStore.setState({ audioFile, musicName })
            })
        }),
    }), { order: 200, collapsed: true }, [musicName])

    const playerRef = useRef<HTMLVideoElement>()

    const onPlay = (e: SyntheticEvent<HTMLVideoElement, Event>) => {
        if (autoHideGui) {
            setGui({ hidden: true })

            // editor mode
            studio?.ui.hide()
        };
        useGlobalStore.setState({ creditsPose: null })
        useGlobalStore.setState({ enabledTransform: false })
    }

    const onPause = (e: SyntheticEvent<HTMLVideoElement, Event>) => {
        if (autoHideGui) {
            setGui({ hidden: false });
        }

        // editor mode
        if (cameraMode == CameraMode.EDITOR) {
            studio.ui.restore()
        }

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
        if(playerRef.current.currentTime == currentTime) return
        playerRef.current.currentTime = currentTime
    }, [currentTime])

    return (
        <>
            <MediaController id="rawPlayer" className={`${styles.player} control-bar`} audio>
                <video
                    ref={onLoaded}
                    slot="media"
                    src={audioFile}
                    onPlay={onPlay}
                    onPause={onPause}
                    onSeeked={onSeeked}
                ></video>
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