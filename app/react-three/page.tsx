"use client"

import LoadingOverlay from "@/app/components/loading-overlay";
import SceneTimeline from "@/app/components/scene-timeline";
import FileSelector from "@/app/components/file-selector";
import WebMMD from "@/app/components/web-mmd";
import ControlBar from "../components/control-bar";
import { useEffect } from "react";
import Script from "next/script";

export default function Page() {
  useEffect(() => {
    window.Ammo();
  }, [])
  return (
    <>
      {/* <LoadingOverlay></LoadingOverlay> */}
      <SceneTimeline></SceneTimeline>
      <WebMMD></WebMMD>
      <ControlBar></ControlBar>
      <FileSelector></FileSelector>
      <Script strategy="beforeInteractive" src="./ammo.wasm.js"></Script>
    </>
  );
}
