import useGlobalStore from "@/app/stores/useGlobalStore";
import useVMD from "../../animation/useVMD";
import usePresetStore from "@/app/stores/usePresetStore";
import { AnimationMixer } from "three";
import { useEffect, useMemo, useState } from "react";
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

    const mixer = useMemo(() => new AnimationMixer(mesh), [mesh]);

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

        return (reset = false) => {
            if (reset) {
                mesh.skeleton.pose()
            } else {
                restoreBones()
            }
            mixer.setTime(player.currentTime)
            saveBones()

            updatePMX()
        }

    }, [mesh])
    const runtimeHelper = useRuntimeHelper()
    const onInit = (reset = false) => {
        onLoop(reset)
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

    useFrame(() => {
        if (!isMotionUpdating()) return
        onLoop()
    }, 1)

    return (
        <>
            {
                motionNames.map((motionName, idx) =>
                    <VMDMotion
                        key={motionName}
                        args={[mesh, mixer, motionFiles[motionName], onInit, motionName]} />
                )
            }
        </>
    )
}

export default CheckModel(Animation);