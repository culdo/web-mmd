import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { buildOnProgress } from "@/app/utils/base";
import { button, useControls } from "leva";
import { useEffect, useRef, useState } from "react";
import { AdditiveAnimationBlendMode, AnimationAction, AnimationClip, AnimationMixer, Camera, LoopOnce, LoopRepeat, NormalAnimationBlendMode, SkinnedMesh } from "three";
import { makeClipAdditive } from "three/src/animation/AnimationUtils.js";

enum TriggerMode {
    PLAYER,
    ALWAYS_RUN,
    KEY_PRESSING,
}

function useVMD(target: Camera | SkinnedMesh, mixer: AnimationMixer, vmdFile: string, onInit?: (reset?: boolean, resetCb?: Function) => void, controlName?: string) {
    const loader = useGlobalStore(state => state.loader)
    const player = useGlobalStore(state => state.player)
    const actionRef = useRef<AnimationAction>()
    const clipRef = useRef<AnimationClip>()
    const [isInit, setIsInit] = useState(false)
    const controlPath = `Model-${target.name}.Motion-${controlName?.split(".")[0]}`
    const currentTime = usePresetStore(state => state.currentTime)

    const {
        "blend mode": blendMode,
        "triggered by": triggeredBy,
        key: keyNeedPressed
    } = useControls(controlPath, {
        "triggered by": {
            value: TriggerMode.PLAYER,
            options: {
                PLAYER: TriggerMode.PLAYER,
                ALWAYS_RUN: TriggerMode.ALWAYS_RUN,
                KEY_PRESSING: TriggerMode.KEY_PRESSING
            }
        },
        "key": {
            value: "",
            render: (get) => {
                const triggeredBy = get(`${controlPath}.triggered by`)
                return triggeredBy == TriggerMode.KEY_PRESSING
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
    }, { collapsed: true, render: () => !!controlName }, [controlName])

    useEffect(() => {
        const init = async () => {
            const clip = await loader.loadAnimation(vmdFile, target, buildOnProgress(vmdFile))
            if (blendMode == AdditiveAnimationBlendMode) {
                makeClipAdditive(clip)
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
            const reset = mixer.existingAction(clipRef.current) === null
            if (actionRef.current) actionRef.current.stop()
            if (clipRef.current) mixer.uncacheAction(clipRef.current)
            onInit?.(reset)
            setIsInit(false)
        }
    }, [vmdFile, target, blendMode])

    const isLockRef = useRef(false)

    const enableMotion = (enabled: boolean) => {
        if (enabled) {
            if (actionRef.current.timeScale == 1.0) return
            actionRef.current.setEffectiveTimeScale(1.0)
        } else {
            if (actionRef.current.timeScale == 0.0) return
            setTimeout(() => {
                actionRef.current.setEffectiveTimeScale(0.0)
                actionRef.current.time = player.currentTime
            }, 10)
        }
    }

    const tempEnable = (cb?: Function) => {
        if (!controlName || isLockRef.current) return
        if (actionRef.current.timeScale == 1.0) {
            enableMotion(false)
            return
        }
        isLockRef.current = true
        enableMotion(true)
        cb?.()
        onInit?.(true, () => {
            enableMotion(false)
            isLockRef.current = false
        })
    }

    // Init triggered by
    useEffect(() => {
        if (!controlName || !isInit) return
        switch (triggeredBy) {
            case TriggerMode.PLAYER:
                enableMotion(false)
                actionRef.current.setLoop(LoopOnce, 1)
                break

            case TriggerMode.KEY_PRESSING:
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
        if (!controlName || !isInit || triggeredBy != TriggerMode.PLAYER) return
        tempEnable()
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
        if (!isInit || triggeredBy != TriggerMode.KEY_PRESSING) return
        const onPress = (e: KeyboardEvent) => {
            if (e.key == keyNeedPressed) {
                enableMotion(true)
            }
        }
        const onRelease = (e: KeyboardEvent) => {
            if (e.key == keyNeedPressed) {
                enableMotion(false)
            }
        }

        document.addEventListener("keydown", onPress)
        document.addEventListener("keyup", onRelease)

        return () => {
            document.removeEventListener("keydown", onPress)
            document.removeEventListener("keyup", onRelease)
        }
    }, [triggeredBy, keyNeedPressed, isInit])

}

export default useVMD;