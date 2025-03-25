"use client"

import { Canvas } from "@react-three/fiber";
import LoadingOverlay from "./components/loading-overlay";
import SceneTimeline from "./components/scene-timeline";
import ThreeWorld from "./components/three-world";
import Effects from "./components/effects";
import FileSelector from "./components/file-selector";
import Panel from "./components/panel";
import dynamic from "next/dynamic";
import { WebGPURenderer } from "three/webgpu";
import usePresetStore from "./stores/usePresetStore";
import { useControls } from "leva";
import { buildGuiObj } from "./utils/gui";
const ControlBar = dynamic(() => import('./components/control-bar'), { ssr: false })

export default function Home() {
  const isWebGPU = usePresetStore(state => state.isWebGPU)
  useControls("Debug", buildGuiObj("isWebGPU"))

  return (
    <>
      <LoadingOverlay></LoadingOverlay>
      <SceneTimeline></SceneTimeline>
      <Canvas
        gl={isWebGPU ?
          async (props) => {
            const renderer = new WebGPURenderer(props as any)
            await renderer.init()
            return renderer
          } : undefined
        }
        shadows>
        <ThreeWorld />
        {
          !isWebGPU && <Effects></Effects>
        }
      </Canvas>
      <ControlBar></ControlBar>
      <FileSelector></FileSelector>
      <Panel></Panel>
    </>
  )
}
