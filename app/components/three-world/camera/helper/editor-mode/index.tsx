import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect } from "react";
import WithReady from "@/app/stores/WithReady";
import useGlobalStore from "@/app/stores/useGlobalStore";
import MMDState from "@/app/presets/MMD.theatre-project-state.json"
import { IStudio } from "@theatre/studio";

function EditorMode() {
    const camera = useThree(state => state.camera)
    const isMotionUpdating = useGlobalStore(state => state.isMotionUpdating)

    useEffect(() => {
        localStorage.setItem("theatre-0.4.persistent", JSON.stringify(MMDState))
        
        let studio: IStudio
        const init = async () => {
            await import("@theatre/core")
            studio = (await import("@theatre/studio")).default
            studio.initialize()
        }
        init()
        return () => studio.ui.hide()
      }, [])

    const _onLoop = useCallback(() => {
        camera.up.set(0, 1, 0);
        camera.up.applyQuaternion(camera.quaternion);
        const targetPos = camera.getObjectByName("target").position
        console.log(targetPos.toArray())
        camera.lookAt(targetPos);
        camera.updateProjectionMatrix();
    }, [camera])
    useFrame(() => {
        if (isMotionUpdating()) _onLoop()
    }, 1)
    return <></>;
}

export default WithReady(EditorMode);