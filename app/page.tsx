"use client"

import { Canvas } from "@react-three/fiber";
import extension from '@theatre/r3f/dist/extension'
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

export default function Home() {

  useEffect(() => {
    studio.initialize()
    studio.extend(extension)
  }, [])

  return (
    <>
      <LoadingOverlay></LoadingOverlay>
      <SceneTimeline></SceneTimeline>
      <Canvas shadows>
        <SheetProvider sheet={getProject('Demo Project').sheet('Demo Sheet')}>
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
