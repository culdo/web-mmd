import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { AnimationAction, AnimationMixer } from "three";
import { useEffect, useMemo, useRef } from "react";
import { useModel, useRuntimeHelper } from "./ModelContext";
import buildUpdatePMX from "./buildUpdatePMX";
import { CheckModel } from "./WithModel";
import VMDMotion from "./VMDMotion";
import { useFrame } from "@react-three/fiber";

function Animation({ motionNames }: { motionNames: string[] }) {
    const mesh = useModel()
    const player = useGlobalStore(state => state.player)
    const motionFiles = usePresetStore(state => state.motionFiles)
    const isMotionUpdating = useGlobalStore(state => state.isMotionUpdating)

    const mixer = useMemo(() => new AnimationMixer(mesh), [mesh]) as AnimationMixer & {
        _actions: AnimationAction[]
    };

    const onLoop = useMemo(() => {
        let backupBones = new Float32Array(mesh.skeleton.bones.length * 7);
        const copyBones = (fromOrTo: "fromArray" | "toArray") => {
            const bones = mesh.skeleton.bones;
            for (let i = 0, il = bones.length; i < il; i++) {
                const bone = bones[i];
                bone.position[fromOrTo](backupBones, i * 7);
                bone.quaternion[fromOrTo](backupBones, i * 7 + 3);
            }
        }

        let init = false;
        const restoreBones = () => {
            if (!init) {
                init = true
                return
            }
            if (isResetPoseRef.current) {
                mesh.pose()
                return
            }
            copyBones("fromArray")
        }
        const saveBones = () => copyBones("toArray")

        const updatePMX = buildUpdatePMX(mesh)

        return (delta: number) => {
            restoreBones()
            if (isResetPoseRef.current || isMotionUpdating()) {
                mixer.setTime(player.currentTime)
                for (const action of mixer._actions) {
                    action.time = player.currentTime
                }
            } else {
                mixer.update(delta)
            }
            saveBones()

            updatePMX()
        }

    }, [mesh])
    const runtimeHelper = useRuntimeHelper()

    const isResetPoseRef = useRef(true)
    const isResetPhysicsRef = useRef(true)

    const resetPose = () => {
        isResetPoseRef.current = true
        resetPhysics()
    }

    const resetPhysics = () => {
        setTimeout(() => {
            isResetPhysicsRef.current = true
        }, 100)
    }

    useEffect(() => {
        mixer.addEventListener('finished', () => {
            player.currentTime = 0.0
            player.pause()
        });
        return () => {
            mixer.stopAllAction()
            mixer.uncacheRoot(mesh)
        }
    }, [mixer])

    useFrame((_, delta) => {
        onLoop(delta)
        if (isResetPoseRef.current) {
            isResetPoseRef.current = false
        }
        if (isResetPhysicsRef.current) {
            runtimeHelper.resetPhysic?.()
            isResetPhysicsRef.current = false
        }
    }, 1)

    return (
        <>
            {
                motionNames.map(motionName =>
                    <VMDMotion
                        key={motionName}
                        target={mesh}
                        mixer={mixer}
                        vmdFile={motionFiles[motionName]}
                        motionName={motionName}
                        resetPose={resetPose}
                        resetPhysic={resetPhysics}
                    />
                )
            }
        </>
    )
}

export default CheckModel(Animation);