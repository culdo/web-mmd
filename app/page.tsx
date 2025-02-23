"use client"

import { Canvas } from "@react-three/fiber";
import { editable as e, SheetProvider } from '@theatre/r3f'

import { getProject } from '@theatre/core'
import studio from '@theatre/studio'
import LoadingOverlay from "./components/loading-overlay";
import SceneTimeline from "./components/scene-timeline";
import ThreeWorld from "./components/three-world";
import Effects from "./components/effects";
import ControlBar from "./components/control-bar";
import FileSelector from "./components/file-selector";
import Panel from "./components/panel";
import { useEffect } from "react";
import MMDState from "./presets/MMD.theatre-project-state.json"

export default function Home() {

  useEffect(() => {
    localStorage.setItem("theatre-0.4.persistent", JSON.stringify(MMDState))
    studio.initialize()
  }, [])

  return (
    <>
      <LoadingOverlay></LoadingOverlay>
      <SceneTimeline></SceneTimeline>
      <Canvas shadows>
        <SheetProvider sheet={getProject('MMD').sheet("MMD UI")}>
          <ThreeWorld />
          <Effects></Effects>
        </SheetProvider>
      </Canvas>
      <ControlBar></ControlBar>
      <FileSelector></FileSelector>
      <Panel></Panel>
    </>
  )
}
