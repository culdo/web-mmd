import useGlobalStore from "@/app/stores/useGlobalStore";
import { buildOnProgress } from "@/app/utils/base";
import { useEffect, useRef } from "react";
import { AnimationAction, AnimationClip, AnimationMixer, Camera, SkinnedMesh } from "three";

function useVMD(target: Camera | SkinnedMesh, mixer: AnimationMixer, vmdFile: string, onInit?: (reset?: boolean, resetCb?: Function) => void) {
    const loader = useGlobalStore(state => state.loader)
    const actionRef = useRef<AnimationAction>()
    const clipRef = useRef<AnimationClip>()

    useEffect(() => {
        const init = async () => {
            const clip = await loader.loadAnimation(vmdFile, target, buildOnProgress(vmdFile))
            const action = mixer.clipAction(clip)
            action.play()
            actionRef.current = action
            clipRef.current = clip
            onInit?.()
        }
        init()
        return () => {
            if (actionRef.current) actionRef.current.stop()
            if (clipRef.current) mixer.uncacheAction(clipRef.current)
            onInit?.()
        }
    }, [vmdFile, target])

}

export default useVMD;