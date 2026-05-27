import useGlobalStore from "@/app/stores/useGlobalStore";
import { buildOnProgress } from "@/app/utils/base";
import { useEffect, useRef } from "react";
import { AnimationAction, AnimationClip, AnimationMixer, Camera, LoopOnce, SkinnedMesh } from "three";

function useVMD(target: Camera | SkinnedMesh, mixer: AnimationMixer, vmdFile: string, onLoad: () => void) {
    const loader = useGlobalStore(state => state.loader)
    const actionRef = useRef<AnimationAction>(null)
    const clipRef = useRef<AnimationClip>(null)

    useEffect(() => {
        const init = async () => {
            const clip = await loader.loadAnimation(vmdFile, target, buildOnProgress(vmdFile))
            const action = mixer.clipAction(clip)
            action.loop = LoopOnce
            action.play()
            actionRef.current = action
            clipRef.current = clip
            onLoad()
        }
        init()
        return () => {
            if (actionRef.current) actionRef.current.stop()
            if (clipRef.current) mixer.uncacheAction(clipRef.current)
            onLoad()
        }
    }, [vmdFile, target])

}

export default useVMD;