"use client"

import FileSelector from "@/app/components/file-selector";
import SceneTimeline from "@/app/components/scene-timeline";
import ThreeWorld from "@/app/components/threeWorld";
import { Canvas } from "@react-three/fiber";
import Script from "next/script";
import { useEffect } from "react";
import ControlBar from "../components/control-bar";
import Panel from "../components/panel";

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
      </Canvas>
      <ControlBar></ControlBar>
      <FileSelector></FileSelector>
      <Panel></Panel>
      <Script strategy="beforeInteractive" src="./ammo.wasm.js"></Script>
    </>
  );
}
