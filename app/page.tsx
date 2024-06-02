"use client"

import LoadingOverlay from "./components/loading-overlay";
import SceneTimeline from "./components/scene-timeline";
import FullScreenButton from "./components/control-bar/fullscreen-button";
import AudioPlayer from "./components/control-bar/audio-player";
import FileSelector from "./components/file-selector";
import { useEffect } from "react";
import WebMMD from "./modules/WebMMD";

export default function Home() {
  useEffect(() => {
    // localforage.clear()
    const app = new WebMMD()
    app.start()
  }, [])
  return (
    <>
      <LoadingOverlay></LoadingOverlay>
      <SceneTimeline></SceneTimeline>
      <AudioPlayer></AudioPlayer>
      <FileSelector></FileSelector>
      <FullScreenButton></FullScreenButton>
    </>
  );
}
