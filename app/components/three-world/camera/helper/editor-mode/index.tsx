import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import useGlobalStore from "@/app/stores/useGlobalStore";
import studio from "@theatre/studio";
import { createRafDriver, getProject, IRafDriver, ISheetObject, onChange, val } from "@theatre/core";

const driver = createRafDriver({ name: 'MMDRafDriver' })

import usePresetStore from "@/app/stores/usePresetStore";
import { cameraToTracks } from "@/app/modules/theatreTrackBuilder";
import { PerspectiveCamera, RafDriverProvider, SheetProvider } from "@theatre/r3f";
import { editable as e } from "@theatre/r3f"
import { Mesh } from "three";
import { CameraObj } from "@/app/types/camera";

function EditorMode() {
    const fov = usePresetStore(state => state.fov)
    const near = usePresetStore(state => state.near)
    const zoom = usePresetStore(state => state.zoom)

    const camera = useThree(state => state.camera)
    const isMotionUpdating = useGlobalStore(state => state.isMotionUpdating)
    const player = useGlobalStore(state => state.player)

    const cameraFile = usePresetStore(state => state.cameraFile)
    const sequence = getProject("MMD").sheet("MMD UI").sequence

    useEffect(() => {

        const init = async () => {
            const resp = await fetch(cameraFile)
            const motionFileBuffer = await resp.arrayBuffer()
            const MMDState = cameraToTracks(motionFileBuffer)
            localStorage.setItem("theatre-0.4.persistent", JSON.stringify(MMDState))
            
            studio.initialize({ __experimental_rafDriver: driver })
            studio.__experimental.__experimental_disblePlayPauseKeyboardShortcut()
            studio.ui.restore()
        }
        init()
        return () => {
            studio.ui.hide()
        }
    }, [])

    // sync with audio player
    useEffect(() => {
        if(!player) return
        // sequence.position = player.currentTime
        const clearOnChange = onChange(sequence.pointer.position, (pos) => {
            if (!player.paused) return
            player.currentTime = pos
        }, driver)
        return clearOnChange
    }, [player])

    const onLoop = useCallback(() => {
        camera.up.set(0, 1, 0);
        camera.up.applyEuler(camera.rotation);
        camera.lookAt(targetRef.current?.position);
    }, [camera])

    useFrame(() => {
        driver?.tick(performance.now())
        if (isMotionUpdating()) {
            sequence.position = player.currentTime
        }
    }, 1)


    const setCameraObj = (obj: ISheetObject<CameraObj>) => {
        useGlobalStore.setState({ "cameraObj": obj })
    }

    const targetRef = useRef<Mesh>()
    return (
        <SheetProvider sheet={getProject('MMD').sheet("MMD UI")}>
            <RafDriverProvider driver={driver}>
                <PerspectiveCamera onTheatreUpdate={onLoop} objRef={setCameraObj} theatreKey="Camera" fov={fov} near={near} zoom={zoom} position={[0, 10, 50]} makeDefault>
                    <e.mesh ref={targetRef} theatreKey="Camera Target" name="target" />
                </PerspectiveCamera>
            </RafDriverProvider>
        </SheetProvider>
    );
}

export default EditorMode;