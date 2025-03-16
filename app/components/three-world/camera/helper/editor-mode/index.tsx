import { useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import useGlobalStore from "@/app/stores/useGlobalStore";
import studio from "@theatre/studio";
import { createRafDriver, getProject, onChange } from "@theatre/core";

const driver = createRafDriver({ name: 'MMDRafDriver' })

import usePresetStore from "@/app/stores/usePresetStore";
import { cameraToTracks } from "@/app/modules/theatreTrackBuilder";
import { PerspectiveCamera as PerspectiveCameraImpl } from "three";

const sheet = getProject("MMD").sheet("MMD UI")
const sequence = sheet.sequence

const target = sheet.object('Camera', {
    position: {
        x: 0,
        y: 0,
        z: 0
    },
    rotation: {
        x: 0,
        y: 0,
        z: 0
    },
    distance: 0,
    fov: 0,
})


function EditorMode() {

    const camera = useThree(state => state.camera) as PerspectiveCameraImpl
    const isMotionUpdating = useGlobalStore(state => state.isMotionUpdating)
    const player = useGlobalStore(state => state.player)

    const cameraFile = usePresetStore(state => state.cameraFile)

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
        if (!player) return
        // sequence.position = player.currentTime
        const clearOnChange = onChange(sequence.pointer.position, (pos) => {
            if (!player.paused) return
            player.currentTime = pos
        }, driver)
        return clearOnChange
    }, [player])

    useEffect(() => {
        const clearUpdate = target.onValuesChange((props) => {
            camera.rotation.set(props.rotation.x, props.rotation.y, props.rotation.z)

            camera.position.set(0, 0, - props.distance);
            camera.position.applyEuler(camera.rotation);
            camera.position.add(props.position);
            
            camera.fov = props.fov
            camera.updateProjectionMatrix()
        }, driver)

        return clearUpdate
    }), [camera]

    useFrame(() => {
        driver?.tick(performance.now())
        if (isMotionUpdating()) {
            sequence.position = player.currentTime
        }
    }, 1)

    return <></>
}

export default EditorMode;