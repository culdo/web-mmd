import usePresetStore from "@/app/stores/usePresetStore";
import styles from "./styles.module.css"
import { CameraMode } from "@/app/modules/MMDCameraWorkHelper";
import { useLayoutEffect, useRef } from "react";
import useGlobalStore from "@/app/stores/useGlobalStore";

function SceneTimeline({ children = null }:
  { children?: React.ReactNode }) {
  const isComposite = usePresetStore(state => state["camera mode"]) == CameraMode.COMPOSITION

  const beatsBufferRef = useGlobalStore(state => state.beatsBufferRef)

  const scrollingBar = useRef<HTMLDivElement>()
  useLayoutEffect(() => {

    // add buffer beats
    [...Array(30)].map(_ => {
      const beatEl = document.createElement("div")
      beatEl.className = "cut"
      beatEl.style.display = "none"
      scrollingBar.current.appendChild(beatEl)
      beatsBufferRef.current.push(beatEl)
      return beatEl
    })
  }, [])

  return (
    <div ref={scrollingBar} className={styles["scrolling-bar"]} style={{ display: isComposite ? "block" : "none" }}>
      <hr />
      <div className={styles["hit-point"]}></div>
      {children}
    </div>
  );
}

export default SceneTimeline;