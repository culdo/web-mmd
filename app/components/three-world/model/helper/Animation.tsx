import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { AnimationAction, AnimationMixer } from "three";
import { useEffect, useMemo, useRef } from "react";
import { CheckModel, useModel } from "./ModelContext";
import buildUpdatePMX from "./buildUpdatePMX";
import VMDMotion from "./VMDMotion";
import { useFrame } from "@react-three/fiber";
import { button, useControls } from "leva";
import isRenderGui from "./useRenderGui";
import useConfigStore from "@/app/stores/useConfigStore";
import Motions from "@/app/components/main-ui/motions";
import useSetMotion from "../../animation/useSetMotion";

function Animation({ motionNames }: { motionNames: string[] }) {
    const mesh = useModel()
    const player = useGlobalStore(state => state.player)
    const motionFiles = useConfigStore(state => state.motionFiles)
    const isResetPoseRef = useRef(false)
    const isSetMotionRef = useSetMotion()

    const mixer = useMemo(() => new AnimationMixer(mesh), [mesh]) as AnimationMixer & {
        _actions: AnimationAction[]
    };

    const blendOptions = Object.keys(motionFiles).filter(val => !motionNames.includes(val))

    const [_, set] = useControls(`Model.${mesh.name}.Animation`, () => ({
        "add motion file": button(() => {
            Motions.onCreate()
        }),
        "blend motion": {
            value: "Select...",
            options: blendOptions,
            onChange: (val, path, options) => {
                if (options.initial || val == "Select...") return
                usePresetStore.setState(({ models }) => {
                    const { motionNames } = models[mesh.name]
                    if (!motionNames.includes(val)) {
                        motionNames.push(val)
                    }
                    return {
                        models: { ...models }
                    }
                })
                set({ "blend motion": "Select..." })
            }
        }
    }), { collapsed: true, render: () => isRenderGui(mesh.name), order: 0 })

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
            if (isResetPoseRef.current || isSetMotionRef.current) {
                // we not use mixer.setTime(currentTime) to reset pose because it will not updated when player is paused (action._effectiveTimeScale is set to 0 in <VMDMotion/>)
                for (const action of mixer._actions) {
                    action.time = player.currentTime
                }
                mixer.update(0.0)
                isSetMotionRef.current = false
            } else {
                mixer.update(delta)
            }
            saveBones()

            updatePMX()
        }

    }, [mesh])

    const resetPose = () => {
        isResetPoseRef.current = true
    }

    useEffect(() => {
        let isEnded = false;
        mixer.addEventListener('finished', (e) => {
            e.action.enabled = true
            if (isEnded) {
                isEnded = false
                return
            }
            isEnded = true
            player.pause()
            const onPlay = () => {
                player.currentTime = 0.0
            }
            player.addEventListener("seeked", () => {
                player.removeEventListener("play", onPlay)
            }, { once: true })
            player.addEventListener("play", onPlay, { once: true })
        });
        return () => {
            mixer.stopAllAction()
            mixer.uncacheRoot(mesh)
        }
    }, [mixer])

    useFrame((_, delta) => {
        onLoop(delta)
        if (isResetPoseRef.current) {
            mesh.userData.resetPhysic?.()
            isResetPoseRef.current = false
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
                    />
                )
            }
        </>
    )
}

export default CheckModel(Animation);