import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { disposeMesh, onProgress } from "@/app/utils/base";
import { buildLoadFileFn, buildLoadModelFn } from "@/app/utils/gui";
import { useFrame, useThree } from "@react-three/fiber";
import { button, useControls } from "leva";
import path from "path-browserify";
import { useLayoutEffect, useState } from "react";
import * as THREE from 'three';
import PromisePrimitive from "../promise-primitive";

function Character() {

    const { scene } = useThree()

    const helper = useGlobalStore(state => state.helper)
    const loader = useGlobalStore(state => state.loader)
    const updateMorphFolder = useGlobalStore(state => state.updateMorphFolder)

    const characterName = usePresetStore(state => state.character)
    const motionName = usePresetStore(state => state.motion)
    const pmxFiles = usePresetStore(state => state.pmxFiles)
    const enableSdef = usePresetStore(state => state["enable SDEF"])
    const enablePBR = usePresetStore(state => state["enable PBR"])
    const followSmooth = usePresetStore(state => state["follow smooth"])
    const motionFile = usePresetStore(state => state.motionFile)
    const selfShadow = usePresetStore(state => state["self shadow"])
    const showIKbones = usePresetStore(state => state["show IK bones"])
    const showRigidBodies = usePresetStore(state => state["show rigid bodies"])
    const physics = usePresetStore(state => state.physics)
    const showSkeleton = usePresetStore(state => state["show skeleton"])

    const url = pmxFiles.character[characterName]

    const [_, set] = useControls('MMD Files', () => ({
        character: {
            value: characterName,
            options: Object.keys(pmxFiles.character),
            onChange: (value, path, options) => {
                if (!options.initial) {
                    usePresetStore.setState({ character: value })
                }
            },
        },
        "select character folder": button(() => {
            const selectFile = document.getElementById("selectFile") as HTMLInputElement
            selectFile.webkitdirectory = true;
            selectFile.onchange = buildLoadModelFn("character")
            selectFile.click();
            selectFile.webkitdirectory = false;
        }),
        motion: {
            value: motionName,
            editable: false
        },
        "select motion file": button(() => {
            const selectFile = document.getElementById("selectFile") as HTMLInputElement
            selectFile.onchange = buildLoadFileFn((motionFile, motion) => {
                usePresetStore.setState({ motionFile, motion })
                set({ motion })
            })
            selectFile.click();
        }),
    }), { order: 2 }, [pmxFiles.character, motionName])

    const [promise, setPromise] = useState(null)
    useLayoutEffect(() => {
        const load = async () => {
            const characterParams = {
                enableSdef,
                enablePBR,
                followSmooth
            };
            if (url.startsWith("data:")) {
                Object.assign(characterParams, {
                    modelExtension: path.extname(characterName).slice(1),
                    modelTextures: pmxFiles.modelTextures.character[characterName]
                });
            }

            const mmd = await loader.loadWithAnimation(url, motionFile, onProgress, () => { }, characterParams as any);
            const character = mmd.mesh;
            character.castShadow = true;
            character.receiveShadow = selfShadow;

            helper.add(character, {
                animation: mmd.animation
            });
            const runtimeCharacter = helper.objects.get(character)

            const ikHelper = runtimeCharacter.ikSolver.createHelper();
            ikHelper.visible = showIKbones;
            character.add(ikHelper);

            const physicsHelper = runtimeCharacter.physics.createHelper();
            physicsHelper.visible = showRigidBodies;
            helper.enable('physics', physics);
            character.add(physicsHelper);

            const skeletonHelper = new THREE.SkeletonHelper(character);
            skeletonHelper.visible = showSkeleton;
            character.add(skeletonHelper);
            
            useGlobalStore.setState({ character, runtimeCharacter })
            set({ character: characterName })
            helper.update(0, usePresetStore.getState().currentTime);
            runtimeCharacter.physics.reset();
            
            return character
        }
        setPromise(load())
        return () => {
            console.log("disposing Character")
            const { character, runtimeCharacter } = useGlobalStore.getState()
            runtimeCharacter.mixer.uncacheRoot(character);
            scene.remove(character);
            helper.remove(character);
            disposeMesh(character);
        }
    }, [url, characterName, motionFile])


    return (
        <PromisePrimitive promise={promise}></PromisePrimitive>
    );
}

export default Character;