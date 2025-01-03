"use client"

import FileSelector from "@/app/components/file-selector";
import SceneTimeline from "@/app/components/scene-timeline";
import ThreeWorld from "@/app/components/three-world";
import { Canvas } from "@react-three/fiber";

import ControlBar from "./components/control-bar";
import Effects from "./components/effects";
import Panel from "./components/panel";
import LoadingOverlay from "./components/loading-overlay";

export default function Page() {

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
  );

}
