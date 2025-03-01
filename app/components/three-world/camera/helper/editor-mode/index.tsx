import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useState } from "react";
import WithReady from "@/app/stores/WithReady";
import useGlobalStore from "@/app/stores/useGlobalStore";
import MMDState from "@/app/presets/MMD.theatre-project-state.json"
import studio from "@theatre/studio";
import { createRafDriver, getProject, IRafDriver, onChange, val } from "@theatre/core";

function EditorMode() {
    const camera = useThree(state => state.camera)
    const isMotionUpdating = useGlobalStore(state => state.isMotionUpdating)
    const player = useGlobalStore(state => state.player)

    const [driver, setDriver] = useState<IRafDriver>()
    useEffect(() => {
        localStorage.setItem("theatre-0.4.persistent", JSON.stringify(MMDState))

        const sequence = getProject("MMD").sheet("MMD UI").sequence
        // sync with audio player
        const clearOnChange = onChange(sequence.pointer.position, (pos) => {
            if(val(sequence.pointer.playing)) return
            player.currentTime = pos
        })
        const init = async () => {
            const driver = createRafDriver({ name: 'MMDRafDriver' })
            setDriver(driver)
            studio.initialize({ __experimental_rafDriver: driver })
            studio.__experimental.__experimental_disblePlayPauseKeyboardShortcut()
            studio.ui.restore()
            // sync with audio player
            sequence.position = player.currentTime
        }
        init()
        return () => {
            studio.ui.hide()
            clearOnChange()
        }
    }, [])

    const _onLoop = useCallback(() => {
        camera.up.set(0, 1, 0);
        camera.up.applyEuler(camera.rotation);
        camera.updateProjectionMatrix();
    }, [camera])

    useFrame(() => {
        driver?.tick(performance.now())
        if (isMotionUpdating()) {
            _onLoop()
        }
    }, 1)
    return <></>;
}

export default WithReady(EditorMode);