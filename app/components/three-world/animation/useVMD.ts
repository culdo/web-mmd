import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { onProgress } from "@/app/utils/base";
import { useFrame } from "@react-three/fiber";
import { use, useEffect } from "react";
import { AnimationMixer, Camera, SkinnedMesh } from "three";

function useVMD(target: Camera | SkinnedMesh, mixer: AnimationMixer, vmdFile: string, onLoop?: Function) {
    const loader = useGlobalStore(state => state.loader)
    const clip = use(loader.loadAnimation(vmdFile, target, onProgress))

    const player = useGlobalStore(state => state.player)
    const isMotionUpdating = useGlobalStore(state => state.isMotionUpdating)

    const _onLoop = (currentTime: number) => {
        if(onLoop) {
            onLoop(() => mixer.setTime(currentTime))
        } else {
            mixer.setTime(currentTime)
        }
    }
    useEffect(() => {
        const savedCurrentTime = usePresetStore.getState().currentTime

        const action = mixer.clipAction(clip)
        action.play()
        _onLoop(savedCurrentTime)
        return () => {
            mixer.stopAllAction()
            mixer.uncacheRoot(target)
        }
    }, [target, vmdFile, onLoop])

    useFrame(() => {
        if (isMotionUpdating()) _onLoop(player.currentTime)
    }, 1)
}

export default useVMD;