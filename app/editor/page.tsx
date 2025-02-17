"use client"

import { Canvas } from "@react-three/fiber";
import studio from '@theatre/studio'
import extension from '@theatre/r3f/dist/extension'
import { SheetProvider } from '@theatre/r3f'
import { getProject } from '@theatre/core'
import LoadingOverlay from "../components/loading-overlay";
import SceneTimeline from "../components/scene-timeline";
import ThreeWorld from "../components/three-world";
import Effects from "../components/effects";
import ControlBar from "../components/control-bar";
import FileSelector from "../components/file-selector";
import Panel from "../components/panel";

studio.initialize()
studio.extend(extension)

// our Theatre.js project sheet, we'll use this later
const demoSheet = getProject('Demo Project').sheet('Demo Sheet')

export default function Home() {

    return (
        <>
            <LoadingOverlay></LoadingOverlay>
            <SceneTimeline></SceneTimeline>
            <Canvas shadows>
                <SheetProvider sheet={demoSheet}>
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
