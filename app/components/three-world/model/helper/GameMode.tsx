import usePresetStore from "@/app/stores/usePresetStore";
import { AnimationAction, AnimationClip, AnimationMixer, MathUtils, Vector3 } from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { useModel, useRuntimeHelper } from "./ModelContext";
import buildUpdatePMX from "./buildUpdatePMX";
import { CheckModel } from "./WithModel";
import { useFrame } from "@react-three/fiber";
import useGlobalStore from "@/app/stores/useGlobalStore";
import makeClipLoopable from "../../animation/makeClipLoopable";
import { buildOnProgress } from "@/app/utils/base";

type Motions = Record<string, {
    name: string,
    action: AnimationAction,
    clip: AnimationClip
}>

const _yAxis = new Vector3(0, 1, 0)

function GameMode() {
    const mesh = useModel()
    const motionFiles = usePresetStore(state => state.motionFiles)
    const loader = useGlobalStore(state => state.loader)

    const motionsRef = useRef<Motions>({
        idle: {
            name: "1.呼吸_(90f_移動なし).vmd",
            action: null,
            clip: null
        },
        walk: {
            name: "2.歩き10L_(40f_前移動20).vmd",
            action: null,
            clip: null
        },
        jump: {
            name: "2.前宙L_(27f_前移動40).vmd",
            action: null,
            clip: null
        }
    })

    const mixer = useMemo(() => new AnimationMixer(mesh), [mesh])

    const onLoop = useMemo(() => {
        let backupBones = new Float32Array(mesh.skeleton.bones.length * 7);
        let init = false;
        const copyBones = (fromOrTo: "fromArray" | "toArray") => {
            if (!init) {
                init = true
                return
            }
            const bones = mesh.skeleton.bones;
            for (let i = 0, il = bones.length; i < il; i++) {
                const bone = bones[i];
                bone.position[fromOrTo](backupBones, i * 7);
                bone.quaternion[fromOrTo](backupBones, i * 7 + 3);
            }
        }

        const restoreBones = () => copyBones("fromArray")
        const saveBones = () => copyBones("toArray")

        const updatePMX = buildUpdatePMX(mesh)

        return (delta: number) => {
            restoreBones()
            mixer.update(delta)
            saveBones()

            updatePMX()
        }

    }, [mesh])
    const runtimeHelper = useRuntimeHelper()

    const [isInit, setInit] = useState(false)
    useEffect(() => {
        const init = async () => {
            for (const [key, motion] of Object.entries(motionsRef.current)) {
                const vmdFile = motionFiles[motion.name]
                const clip = await loader.loadAnimation(vmdFile, mesh, buildOnProgress(vmdFile))
                makeClipLoopable(clip)
                const action = mixer.clipAction(clip)
                if (key != "idle") {
                    action.setEffectiveWeight(0.0)
                }
                action.play()
                motion.clip = clip
                motion.action = action
            }
            setInit(true)
            runtimeHelper.resetPhysic?.()
        }
        init()
        return () => {
            mixer.stopAllAction()
            mixer.uncacheRoot(mesh)
            setInit(false)
        }
    }, [mixer])

    const rotateYDeltaRef = useRef(0.0)
    const rotateYDampRef = useRef(0.0)
    const velocityRef = useRef(0.0)
    const velocityDampRef = useRef(0.0)


    function setWeight(action: AnimationAction, weight: number) {
        action.enabled = true;
        action.setEffectiveTimeScale(1);
        action.setEffectiveWeight(weight);
    }

    // Triggered by key pressing
    useEffect(() => {
        if (!isInit) return
        const idleAction = motionsRef.current.idle.action
        const walkAction = motionsRef.current.walk.action
        const jumpAction = motionsRef.current.jump.action
        const onPress = (e: KeyboardEvent) => {
            if (e.repeat) return
            if (e.key == "w") {
                setWeight(walkAction, 1.0)
                walkAction.crossFadeFrom(idleAction, 0.2, false)
                velocityRef.current = 0.7
            }
            if (e.key == "a") {
                rotateYDeltaRef.current = 0.2
            }
            if (e.key == "s") {
                setWeight(walkAction, 1.0)
                walkAction.warp(1.0, -1.0, 0.5)
                velocityRef.current = -0.3
            }
            if (e.key == "d") {
                rotateYDeltaRef.current = -0.2
            }
            if (e.key == " ") {
                setWeight(jumpAction, 1.0)
                jumpAction.crossFadeFrom(idleAction, 0.2, false)
            }
        }

        const onRelease = (e: KeyboardEvent) => {
            if (["w", "s", " "].includes(e.key)) {
                setWeight(idleAction, 1.0)
                idleAction.crossFadeFrom(walkAction, 0.2, false)
                velocityRef.current = 0.0
            }
            if ([" "].includes(e.key)) {
                setWeight(idleAction, 1.0)
                idleAction.crossFadeFrom(jumpAction, 0.2, false)
            }
            if (["a", "d"].includes(e.key)) {
                rotateYDeltaRef.current = 0.0
            }
        }

        document.addEventListener("keydown", onPress)
        document.addEventListener("keyup", onRelease)

        return () => {
            document.removeEventListener("keydown", onPress)
            document.removeEventListener("keyup", onRelease)
        }
    }, [isInit])

    const posDeltaRef = useRef(new Vector3(0, 0, 0))
    useFrame((_, delta) => {
        if (!isInit) return
        rotateYDampRef.current = MathUtils.damp(rotateYDampRef.current, rotateYDeltaRef.current, 10.0, delta)
        mesh.rotation.y += rotateYDampRef.current % Math.PI * 2

        posDeltaRef.current.set(0, 0, velocityRef.current * motionsRef.current.walk.action.weight)
        mesh.position.add(posDeltaRef.current.applyAxisAngle(_yAxis, mesh.rotation.y))
        onLoop(delta)
    }, 1)

    return <></>
}

export default CheckModel(GameMode);