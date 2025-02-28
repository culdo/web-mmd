import useGlobalStore from "@/app/stores/useGlobalStore";
import useVMD from "../animation/useVMD";
import usePresetStore from "@/app/stores/usePresetStore";
import { AnimationMixer } from "three";
import { useEffect, useMemo } from "react";
import { useModel, useRuntimeHelper } from "./ModelContext";
import buildUpdatePMX from "./buildUpdatePMX";

function Animation() {
    const mesh = useModel()
    const player = useGlobalStore(state => state.player)
    const motionFile = usePresetStore(state => state.motionFile)

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

        return (setTime: () => void) => {
            restoreBones()
            setTime()
            saveBones()

            updatePMX()
        }

    }, [mesh])
    const runtimeHelper = useRuntimeHelper()
    const onInit = () => {
        runtimeHelper.resetPhysic?.()
    }
    useVMD(mesh, mixer, motionFile, onLoop, onInit)

    useEffect(() => {
        mixer.addEventListener('loop', () => {
            player.currentTime = 0.0
            player.pause()
        });
    }, [mixer])
    return <></>
}

export default Animation;