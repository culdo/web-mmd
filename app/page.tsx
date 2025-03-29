"use client"

import { Canvas } from "@react-three/fiber";
import LoadingOverlay from "./components/loading-overlay";
import SceneTimeline from "./components/scene-timeline";
import ThreeWorld from "./components/three-world";
import FileSelector from "./components/file-selector";
import Panel from "./components/panel";
import dynamic from "next/dynamic";
const ControlBar = dynamic(() => import('./components/control-bar'), { ssr: false })

export default function Home() {

  return (
    <>
      <LoadingOverlay></LoadingOverlay>
      <SceneTimeline></SceneTimeline>
      <Canvas shadows>
        <ThreeWorld />
      </Canvas>
      <ControlBar></ControlBar>
      <FileSelector></FileSelector>
      <Panel></Panel>
    </>
  )
}
