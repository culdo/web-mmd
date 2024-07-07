"use client"

import FileSelector from "@/app/components/file-selector";
import SceneTimeline from "@/app/components/scene-timeline";
import ThreeWorld from "@/app/components/three-world";
import { Canvas } from "@react-three/fiber";

import ControlBar from "../components/control-bar";
import Effects from "../components/effects";
import Panel from "../components/panel";
import usePresetStore from "../stores/usePresetStore";

export default function Page() {

  const isOneDpr = usePresetStore(state => state["set pixelratio 1.0"])

  return (
    <>
      <SceneTimeline></SceneTimeline>
      <Canvas dpr={isOneDpr ? 1 : window.devicePixelRatio}>
        <ThreeWorld />
        <Effects></Effects>
      </Canvas>
      <ControlBar></ControlBar>
      <FileSelector></FileSelector>
      <Panel></Panel>
    </>
  );

}
