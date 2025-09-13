import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { buildOnProgress } from "@/app/utils/base";
import { button, useControls } from "leva";
import { useEffect, useRef, useState } from "react";
import { AdditiveAnimationBlendMode, AnimationAction, AnimationClip, AnimationMixer, Camera, LoopOnce, LoopRepeat, NormalAnimationBlendMode, SkinnedMesh } from "three";
import { makeClipAdditive } from "three/src/animation/AnimationUtils.js";
import makeClipLoopable from "./makeClipLoopable";
import isRenderGui from "../model/helper/useRenderGui";

enum TriggerMode {
    PLAYER,
    ALWAYS_RUN,
    GAME_CONTROL,
}

function useVMD(target: Camera | SkinnedMesh, mixer: AnimationMixer, vmdFile: string, onInit?: (reset?: boolean, resetCb?: Function) => void, controlName?: string) {
    const loader = useGlobalStore(state => state.loader)
    const player = useGlobalStore(state => state.player)
    const actionRef = useRef<AnimationAction>()
    const clipRef = useRef<AnimationClip>()
    const [isInit, setIsInit] = useState(false)
    const controlPath = `Model-${target.name}.Motion-${controlName?.split(".vmd")[0].replaceAll(".", "-")}`
    const currentTime = usePresetStore(state => state.currentTime)

    const {
        "blend mode": blendMode,
        "triggered by": triggeredBy
    } = useControls(controlPath, {
        "triggered by": {
            value: TriggerMode.PLAYER,
            options: {
                PLAYER: TriggerMode.PLAYER,
                ALWAYS_RUN: TriggerMode.ALWAYS_RUN,
                GAME_CONTROL: TriggerMode.GAME_CONTROL
            }
        },
        "blend mode": {
            value: NormalAnimationBlendMode,
            options: { NormalAnimationBlendMode, AdditiveAnimationBlendMode }
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
            max: 2.0,
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
    }, { collapsed: true, render: () => !!controlName && isRenderGui(target.name) }, [controlName])

    useEffect(() => {
        const init = async () => {
            const clip = await loader.loadAnimation(vmdFile, target, buildOnProgress(vmdFile))
            if (blendMode == AdditiveAnimationBlendMode) {
                makeClipAdditive(clip)
            }
            if (triggeredBy != TriggerMode.PLAYER) {
                makeClipLoopable(clip)
            }
            clipRef.current = clip
            const action = mixer.clipAction(clip)
            actionRef.current = action
            action.play()
            onInit?.()
            setIsInit(true)
        }
        init()
        return () => {
            if (actionRef.current) actionRef.current.stop()
            if (clipRef.current) mixer.uncacheAction(clipRef.current)
            const reset = mixer.existingAction(clipRef.current) === null
            if (target instanceof SkinnedMesh && reset) target.skeleton.pose()
            onInit?.(reset)
            setIsInit(false)
        }
    }, [vmdFile, target, triggeredBy, blendMode])

    const enableMotion = (enabled: boolean) => {
        if (enabled) {
            if (actionRef.current.timeScale == 1.0) return
            actionRef.current.setEffectiveTimeScale(1.0)
        } else {
            setTimeout(() => {
                actionRef.current.setEffectiveTimeScale(0.0)
                if (triggeredBy == TriggerMode.PLAYER) actionRef.current.time = player.currentTime
            }, 10)
        }
    }

    // Init triggered by
    useEffect(() => {
        if (!controlName || !isInit) return
        switch (triggeredBy) {
            case TriggerMode.PLAYER:
                enableMotion(false)
                actionRef.current.setLoop(LoopOnce, 1)
                break

            case TriggerMode.GAME_CONTROL:
                enableMotion(false)
                actionRef.current.setLoop(LoopRepeat, Infinity)
                break

            case TriggerMode.ALWAYS_RUN:
                enableMotion(true)
                actionRef.current.setLoop(LoopRepeat, Infinity)
                break
        }
    }, [isInit, triggeredBy])

    // On player pause and seeking
    useEffect(() => {
        if (!controlName || !player.paused || !isInit || triggeredBy != TriggerMode.PLAYER) return
        enableMotion(false)
    }, [isInit, triggeredBy, currentTime])

    // Triggered by player
    useEffect(() => {
        if (!controlName || !isInit || triggeredBy != TriggerMode.PLAYER) return
        const onPlay = () => {
            enableMotion(true)
        }

        player.addEventListener("play", onPlay)

        return () => {
            player.removeEventListener("play", onPlay)
        }
    }, [player, triggeredBy, isInit])

    // Triggered by key pressing
    useEffect(() => {
        if (!isInit || triggeredBy != TriggerMode.GAME_CONTROL) return
        const onPress = (e: KeyboardEvent) => {
            if (e.key == "w") {
                actionRef.current.setEffectiveTimeScale(1.0)
            }
            if (e.key == "s") {
                actionRef.current.setEffectiveTimeScale(-1.0)
            }
        }
        const onRelease = (e: KeyboardEvent) => {
            if (["w", "s"].includes(e.key)) {
                enableMotion(false)
            }
        }

        document.addEventListener("keydown", onPress)
        document.addEventListener("keyup", onRelease)

        return () => {
            document.removeEventListener("keydown", onPress)
            document.removeEventListener("keyup", onRelease)
        }
    }, [triggeredBy, isInit])

}

export default useVMD;