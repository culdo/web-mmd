"use client"

import FileSelector from "@/app/components/file-selector";
import SceneTimeline from "@/app/components/scene-timeline";
import ThreeWorld from "@/app/components/threeWorld";
import { Canvas } from "@react-three/fiber";
import { Bloom, DepthOfField, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'

import Script from "next/script";
import { useEffect } from "react";
import ControlBar from "../components/control-bar";
import Panel from "../components/panel";
import OutlinePass from "../components/effects/OutlinePass";

export default function Page() {
  useEffect(() => {
    window.Ammo();
  }, [])
  return (
    <>
      {/* <LoadingOverlay></LoadingOverlay> */}
      <SceneTimeline></SceneTimeline>
      <Canvas>
        <ThreeWorld></ThreeWorld>
        <EffectComposer>
          <OutlinePass></OutlinePass>
        </EffectComposer>
      </Canvas>
      <ControlBar></ControlBar>
      <FileSelector></FileSelector>
      <Panel></Panel>
      <Script strategy="beforeInteractive" src="./ammo.wasm.js"></Script>
    </>
  );
}
