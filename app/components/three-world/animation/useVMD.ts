import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { buildOnProgress } from "@/app/utils/base";
import { button, useControls } from "leva";
import { useEffect, useRef } from "react";
import { AdditiveAnimationBlendMode, AnimationAction, AnimationClip, AnimationMixer, Camera, LoopOnce, LoopPingPong, LoopRepeat, NormalAnimationBlendMode, SkinnedMesh } from "three";
import { makeClipAdditive } from "three/src/animation/AnimationUtils.js";

function useVMD(target: Camera | SkinnedMesh, mixer: AnimationMixer, vmdFile: string, onInit?: (reset?: boolean) => void, controlName?: string) {
    const loader = useGlobalStore(state => state.loader)
    const actionRef = useRef<AnimationAction>()
    const clipRef = useRef<AnimationClip>()

    const {
        "blend mode": blendMode,
        "loop mode": loopMode
    } = useControls(`Model-${target.name}.Motion-${controlName?.split(".")[0]}`, {
        "blend mode": {
            value: NormalAnimationBlendMode,
            options: { NormalAnimationBlendMode, AdditiveAnimationBlendMode }
        },
        "loop mode": {
            value: LoopOnce,
            options: { LoopOnce, LoopRepeat, LoopPingPong }
        },
        weight: {
            value: 1.0,
            min: 0.0,
            max: 1.0,
            onChange: (val) => {
                if (!actionRef.current) return
                actionRef.current.setEffectiveWeight(val)
                onInit?.()
            }
        },
        timeScale: {
            value: 1.0,
            min: 0.0,
            max: 100.0,
            onChange: (val) => {
                if (!actionRef.current) return
                actionRef.current.setEffectiveTimeScale(val)
                onInit?.()
            }
        },
        delete: button(() => {
            usePresetStore.setState(({ models }) => {
                const { motionNames } = models[target.name]
                if (motionNames.indexOf(controlName) > -1) {
                    motionNames.splice(motionNames.indexOf(controlName), 1)
                }
                return { models: { ...models } }
            })
        })
    }, { collapsed: true, render: () => !!controlName }, [controlName])

    useEffect(() => {
        const init = async () => {
            const clip = await loader.loadAnimation(vmdFile, target, buildOnProgress(vmdFile))
            if (blendMode == AdditiveAnimationBlendMode) {
                makeClipAdditive(clip)
            }
            clipRef.current = clip
            const action = mixer.clipAction(clip)
            action.setLoop(loopMode, loopMode == LoopOnce ? 1 : Infinity)
            actionRef.current = action
            action.play()
            onInit?.()
        }
        init()
        return () => {
            if (actionRef.current) actionRef.current.stop()
            if (clipRef.current) mixer.uncacheAction(clipRef.current)
            onInit?.(true)
        }
    }, [vmdFile, target, blendMode, loopMode])
}

export default useVMD;