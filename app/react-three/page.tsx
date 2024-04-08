"use client"

import LoadingOverlay from "@/app/components/loading-overlay";
import SceneTimeline from "@/app/components/scene-timeline";
import FileSelector from "@/app/components/file-selector";
import WebMMD from "@/app/components/web-mmd";
import ControlBar from "../components/control-bar";
import { useEffect } from "react";
import Script from "next/script";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import useGlobalStore from "../stores/useGlobalStore";

export default function Page() {
  const { gui } = useGlobalStore()
  useEffect(() => {
    window.Ammo();
  }, [])
  return (
    <>
      {/* <LoadingOverlay></LoadingOverlay> */}
      <SceneTimeline></SceneTimeline>
      <Canvas>
        <WebMMD></WebMMD>
      </Canvas>
      <ControlBar></ControlBar>
      <FileSelector></FileSelector>
      <Leva {...gui}></Leva>
      <Script strategy="beforeInteractive" src="./ammo.wasm.js"></Script>
    </>
  );
}
