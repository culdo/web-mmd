import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { disposeMesh, onProgress } from "@/app/utils/base";
import { useThree } from "@react-three/fiber";
import path from "path-browserify";
import { Suspense, useCallback, useLayoutEffect, useMemo, useState } from "react";
import * as THREE from 'three';
import PromisePrimitive from "../promise-primitive";
import { useControls } from "leva";

function Character() {

    const { scene } = useThree()

    const helper = useGlobalStore(state => state.helper)
    const loader = useGlobalStore(state => state.loader)
    const updateMorphFolder = useGlobalStore(state => state.updateMorphFolder)

    const character = usePresetStore(state => state.character)
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

    const url = pmxFiles.character[character]
    const filename = character

    const gui = useControls({
        character: false
    })

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
                    modelExtension: path.extname(filename).slice(1),
                    modelTextures: pmxFiles.modelTextures.character[filename]
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

            runtimeCharacter.physics.reset();

            useGlobalStore.setState({ character, runtimeCharacter })

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
    }, [url, filename, motionFile, gui.character])
    return (
        <PromisePrimitive promise={promise}></PromisePrimitive>
    );
}

export default Character;