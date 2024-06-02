"use client"

import FileSelector from "@/app/components/file-selector";
import SceneTimeline from "@/app/components/scene-timeline";
import ThreeWorld from "@/app/components/three-world";
import { Canvas } from "@react-three/fiber";

import { useState } from "react";
import ControlBar from "../components/control-bar";
import Panel from "../components/panel";
import Effects from "../components/effects";
import usePresetStore from "../stores/usePresetStore";
import LoadingOverlay from "../components/loading-overlay";

export default function Page() {

  const [presetReady, setPresetReady] = useState(false)
  usePresetStore.persist.onFinishHydration(() => {
    setPresetReady(true)
  })
  usePresetStore.persist.onHydrate(() => {
    setPresetReady(false)
  })

  if (!presetReady) return <LoadingOverlay />
  return (
        <>
          <SceneTimeline></SceneTimeline>
          <Canvas>
            <ThreeWorld></ThreeWorld>
            <Effects></Effects>
          </Canvas>
          <ControlBar></ControlBar>
          <FileSelector></FileSelector>
          <Panel></Panel>
        </>
  );

}
