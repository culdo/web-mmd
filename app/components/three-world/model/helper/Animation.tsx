import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { AnimationAction, AnimationMixer } from "three";
import { useEffect, useMemo, useRef } from "react";
import { useModel, useRuntimeHelper } from "./ModelContext";
import buildUpdatePMX from "./buildUpdatePMX";
import { CheckModel } from "./WithModel";
import VMDMotion from "./VMDMotion";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import isRenderGui from "./useRenderGui";

function Animation({ motionNames }: { motionNames: string[] }) {
    const mesh = useModel()
    const player = useGlobalStore(state => state.player)
    const motionFiles = usePresetStore(state => state.motionFiles)
    const isMotionUpdating = useGlobalStore(state => state.isMotionUpdating)

    const mixer = useMemo(() => new AnimationMixer(mesh), [mesh]) as AnimationMixer & {
        _actions: AnimationAction[]
    };

    const blendOptions = Object.keys(motionFiles).filter(val => !motionNames.includes(val))
    const [, set] = useControls(`Model-${mesh.name}`, () => ({
        "blend motion": {
            value: "Select...",
            options: blendOptions,
            onChange: (val, path, options) => {
                if (options.initial || val == "Select...") return
                usePresetStore.setState(({ models }) => {
                    const motionNames = models[mesh.name].motionNames
                    if (motionNames.includes(val)) return {}
                    motionNames.push(val)
                    return {
                        models: { ...models }
                    }
                })
                set({ "blend motion": "Select..." })
            }
        }
    }), { order: 2, render: () => isRenderGui(mesh.name) }, [blendOptions])

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
        const restoreBones = (reset = false) => {
            if (!init) {
                init = true
                return
            }
            if (reset) {
                mesh.skeleton.pose()
            } else {
                copyBones("fromArray")
            }
        }
        const saveBones = () => copyBones("toArray")

        const updatePMX = buildUpdatePMX(mesh)

        return (reset = false, delta?: number) => {
            restoreBones(reset)
            if (delta && !isMotionUpdating()) {
                mixer.update(delta)
            } else {
                mixer.setTime(player.currentTime)
            }
            saveBones()

            updatePMX()
        }

    }, [mesh])
    const runtimeHelper = useRuntimeHelper()

    const isResetRef = useRef(false)

    const onInit = (reset = false) => {
        isResetRef.current = reset
        runtimeHelper.resetPhysic?.()
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
        onLoop(isResetRef.current, isResetRef.current ? undefined : delta)
        isResetRef.current = false
    }, 1)

    return (
        <>
            {
                motionNames.map(motionName =>
                    <VMDMotion
                        key={motionName}
                        args={[mesh, mixer, motionFiles[motionName], onInit, motionName]} />
                )
            }
        </>
    )
}

export default CheckModel(Animation);