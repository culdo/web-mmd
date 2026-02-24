import { AnimationAction, AnimationClip, AnimationMixer, Quaternion, Vector3 } from "three";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import buildUpdatePMX from "../../../../../model/helper/buildUpdatePMX";
import { useFrame } from "@react-three/fiber";
import useGlobalStore from "@/app/stores/useGlobalStore";
import makeClipLoopable from "../../../../../animation/makeClipLoopable";
import { buildOnProgress } from "@/app/utils/base";
import { RemoteModelContext } from ".";
import useConfigStore from "@/app/stores/useConfigStore";

type ActionsType = Record<string, {
    name: string,
    action: AnimationAction,
    clip: AnimationClip
}>

function Actions() {
    const { mesh, channel } = useContext(RemoteModelContext)

    const motionFiles = useConfigStore(state => state.motionFiles)
    const loader = useGlobalStore(state => state.loader)

    const motionsRef = useRef<ActionsType>({
        idle: {
            name: "ぼんやり待ち合わせ_腕広いver(465f).vmd",
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
                mesh.pose()
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
            mesh.userData.resetPhysic?.()
        }
        init()
        return () => {
            mixer.stopAllAction()
            mixer.uncacheRoot(mesh)
            setInit(false)
        }
    }, [mixer])

    const rotateYVelocityRef = useRef(0.0)
    const velocityRef = useRef(0.0)
    const targetTurnRef = useRef(new Quaternion(0, 0, 0, 0))

    function setWeight(action: AnimationAction, weight: number) {
        action.enabled = true;
        action.setEffectiveTimeScale(1);
        action.setEffectiveWeight(weight);
    }

    // Triggered by data recieved
    useEffect(() => {
        if (!isInit) return
        const idleAction = motionsRef.current.idle.action
        const walkAction = motionsRef.current.walk.action
        const jumpAction = motionsRef.current.jump.action
        const onPress = (key: string) => {
            const isStart = velocityRef.current == 0.0 && rotateYVelocityRef.current == 0.0
            if (["w", "a", "s", "d"].includes(key) && isStart) {
                setWeight(walkAction, 1.0)
                walkAction.crossFadeFrom(idleAction, 0.2, false)
            }
            if (key == "w") {
                velocityRef.current = 15
            }
            if (key == "a") {
                rotateYVelocityRef.current = 2
            }
            if (key == "s") {
                _quat.setFromAxisAngle(_yAxis, Math.PI)
                targetTurnRef.current.multiplyQuaternions(mesh.quaternion, _quat)
                rotateYVelocityRef.current = 8
            }
            if (key == "d") {
                rotateYVelocityRef.current = -2
            }
            if (key == " ") {
                const startAction = isStart ? idleAction : walkAction
                setWeight(jumpAction, 1.0)
                jumpAction.crossFadeFrom(startAction, 0.2, false)
            }
        }

        const onRelease = (key: string) => {
            if (key == "w") {
                velocityRef.current = 0.0
            }
            if (["a", "d"].includes(key)) {
                rotateYVelocityRef.current = 0.0
            }
            const isStop = velocityRef.current == 0.0 && rotateYVelocityRef.current == 0.0
            if (["w", "a", "d"].includes(key) && isStop) {
                setWeight(idleAction, 1.0)
                idleAction.crossFadeFrom(walkAction, 0.2, false)
            }
            if ([" "].includes(key)) {
                const endAction = isStop ? idleAction : walkAction
                setWeight(endAction, 1.0)
                endAction.crossFadeFrom(jumpAction, 0.2, false)
            }
        }

        const onMessage = (e: MessageEvent) => {
            const { type, payload } = JSON.parse(e.data) as EventData
            if (type == "keydown") {
                onPress(payload)
            }
            if (type == "keyup") {
                onRelease(payload)
            }
        }

        channel.addEventListener("message", onMessage)

        return () => {
            mesh.position.set(0, 0, 0)
            mesh.rotation.set(0, 0, 0)
            channel.removeEventListener("message", onMessage)
        }
    }, [isInit])

    const _quat = useRef(new Quaternion()).current
    const _yAxis = useRef(new Vector3(0, 1, 0)).current
    useFrame((_, delta) => {
        if (!isInit) return
        const walkAction = motionsRef.current.walk.action
        const rotDelta = rotateYVelocityRef.current * delta * walkAction.weight

        if (targetTurnRef.current.length() > 0 && mesh.quaternion.angleTo(targetTurnRef.current) < rotDelta) {
            mesh.quaternion.copy(targetTurnRef.current)
            rotateYVelocityRef.current = 0.0
            targetTurnRef.current.set(0, 0, 0, 0)
            const idleAction = motionsRef.current.idle.action
            setWeight(idleAction, 1.0)
            idleAction.crossFadeFrom(walkAction, 0.2, false)
        }

        onLoop(delta)
    }, 1)

    return <></>
}

export default Actions;