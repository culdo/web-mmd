import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { disposeMesh, onProgress } from "@/app/utils/base";
import { useThree } from "@react-three/fiber";
import path from "path-browserify";
import { Suspense, useCallback, useMemo } from "react";
import * as THREE from 'three';
import PromisePrimitive from "../promise-primitive";

function Character() {

    const { scene } = useThree()

    const { helper, loader, updateMorphFolder } = useGlobalStore()
    const api = usePresetStore()

    const url = api.pmxFiles.character[api.character]
    const filename = api.character

    const promise = useMemo(async () => {
        const characterParams = {
            enableSdef: api['enable SDEF'],
            enablePBR: api['enable PBR'],
            followSmooth: api["follow smooth"]
        };
        if (url.startsWith("data:")) {
            Object.assign(characterParams, {
                modelExtension: path.extname(filename).slice(1),
                modelTextures: api.pmxFiles.modelTextures.character[filename]
            });
        }

        const mmd = await loader.loadWithAnimation(url, api.motionFile, onProgress, () => { }, characterParams as any);
        const character = mmd.mesh;
        character.castShadow = true;
        character.receiveShadow = api["self shadow"];

        helper.add(character, {
            animation: mmd.animation
        });
        const runtimeCharacter = helper.objects.get(character)

        const ikHelper = runtimeCharacter.ikSolver.createHelper();
        ikHelper.visible = api['show IK bones'];
        character.add(ikHelper);

        const physicsHelper = runtimeCharacter.physics.createHelper();
        physicsHelper.visible = api['show rigid bodies'];
        helper.enable('physics', api['physics']);
        character.add(physicsHelper);

        const skeletonHelper = new THREE.SkeletonHelper(character);
        skeletonHelper.visible = api['show skeleton'];
        character.add(skeletonHelper);

        runtimeCharacter.physics.reset();

        if (api.character != filename) {
            api.character = filename
            updateMorphFolder()
        }
        useGlobalStore.setState({ character, runtimeCharacter })

        return character
    }, [url, filename])

    const disposeCharacter = useCallback(
        () => {
            const { character, runtimeCharacter } = useGlobalStore.getState()
            runtimeCharacter.mixer.uncacheRoot(character);
            scene.remove(character);
            helper.remove(character);
            disposeMesh(character);
            console.log("disposeCharacter")
        }, [])

    return (
        <Suspense fallback={null}>
            <PromisePrimitive promise={promise} dispose={disposeCharacter}></PromisePrimitive>
        </Suspense>
    );
}

export default Character;