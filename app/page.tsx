"use client"

import { Canvas } from "@react-three/fiber";
import LoadingOverlay from "./components/loading-overlay";
import SceneTimeline from "./components/scene-timeline";
import ThreeWorld from "./components/three-world";
import Effects from "./components/effects";
import ControlBar from "./components/control-bar";
import FileSelector from "./components/file-selector";
import Panel from "./components/panel";

export default function Home() {
  return (
    <>
      <LoadingOverlay></LoadingOverlay>
      <SceneTimeline></SceneTimeline>
      <Canvas shadows>
        <ThreeWorld />
        <Effects></Effects>
      </Canvas>
      <ControlBar></ControlBar>
      <FileSelector></FileSelector>
      <Panel></Panel>
    </>
  )
}
