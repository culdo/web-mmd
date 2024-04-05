"use client"

import LoadingOverlay from "./components/loading-overlay";
import SceneTimeline from "./components/scene-timeline";
import FullScreenButton from "./components/control-bar/fullscreen-button";
import AudioPlayer from "./components/control-bar/audio-player";
import FileSelector from "./components/file-selector";
import WebMMD from "./components/web-mmd-legacy";

export default function Home() {

  return (
    <>
      <LoadingOverlay></LoadingOverlay>
      <SceneTimeline></SceneTimeline>
      <WebMMD></WebMMD>
      <AudioPlayer></AudioPlayer>
      <FileSelector></FileSelector>
      <FullScreenButton></FullScreenButton>
    </>
  );
}
