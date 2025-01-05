import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { onProgress } from "@/app/utils/base";
import { useFrame } from "@react-three/fiber";
import { use, useEffect } from "react";
import { AnimationMixer, Camera, SkinnedMesh } from "three";

function useAnimation(target: Camera | SkinnedMesh, mixer: AnimationMixer, vmdFile: string, callback?: Function) {
    const loader = useGlobalStore(state => state.loader)
    const clip = use(loader.loadAnimation(vmdFile, target, onProgress))

    const player = useGlobalStore(state => state.player)
    const isMotionUpdating = useGlobalStore(state => state.isMotionUpdating)

    const setTime = (currentTime: number) => {
        mixer.setTime(currentTime)
        callback(currentTime)
    }
    useEffect(() => {
        const savedCurrentTime = usePresetStore.getState().currentTime

        const action = mixer.clipAction(clip)
        action.play()
        if(callback) setTime(savedCurrentTime)
        return () => {
            mixer.stopAllAction()
            mixer.uncacheRoot(target)
        }
    }, [target, vmdFile, callback])

    useFrame(() => {
        if (isMotionUpdating.current) setTime(player.currentTime)
    }, 1)
}

export default useAnimation;