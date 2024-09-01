import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { disposeMesh, onProgress } from "@/app/utils/base";
import { buildGuiItem, buildLoadFileFn, buildLoadModelFn } from "@/app/utils/gui";
import { useThree } from "@react-three/fiber";
import { button, useControls } from "leva";
import path from "path-browserify";
import { useLayoutEffect } from "react";
import * as THREE from 'three';
import ModelController from "../ModelController";
import PromisePrimitive from "../promise-primitive";
import Pose from "./Pose";

function CharacterBase() {

    const { scene } = useThree()

    const helper = useGlobalStore(state => state.helper)
    const loader = useGlobalStore(state => state.loader)
    const characterPromise = useGlobalStore(state => state.characterPromise)

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

    const positionKey = "Character.position"
    const position = usePresetStore(state => state[positionKey])

    const url = pmxFiles.character[characterName]

    const [_, set] = useControls('Character', () => ({
        "model": {
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
        "position": buildGuiItem(positionKey),
        "reset": button(() => {
            set({position: [0, 0, 0]})
        }),
        "motion name": {
            value: motionName,
            editable: false
        },
        "select motion file": button(() => {
            const selectFile = document.getElementById("selectFile") as HTMLInputElement
            selectFile.onchange = buildLoadFileFn((motionFile, motion) => {
                usePresetStore.setState({ motionFile, motion })
                set({ "motion name": motion })
            })
            selectFile.click();
        }),
    }), { order: 2 }, [pmxFiles.character, motionName])

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
                animation: mmd.animation,
                unitStep: 1/60,
                maxStepNum: 1,
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
            set({ model: characterName })
            helper.update(0, usePresetStore.getState().currentTime);
            runtimeCharacter.physics.reset();

            return character
        }
        useGlobalStore.setState({characterPromise: load()})
        return () => {
            const { character, runtimeCharacter } = useGlobalStore.getState()
            runtimeCharacter.mixer.uncacheRoot(character);
            scene.remove(character);
            helper.remove(character);
            disposeMesh(character);
            console.log("Character disposed")
        }
    }, [url, characterName, motionFile, enablePBR])

    return (
        <>
            <PromisePrimitive
                name={positionKey}
                position={position}
                promise={characterPromise}
                onClick={(e: Event) => {
                    e.stopPropagation()
                    useGlobalStore.setState(({ selectedName: positionKey }))
                }}
                onPointerMissed={(e: Event) => {
                    e.type === 'click' && useGlobalStore.setState({ selectedName: null })

                }}
            />
            <Pose></Pose>
        </>
    );
}

function Character() {
    return (
        <>
            <CharacterBase></CharacterBase>
            <ModelController type="Character"></ModelController>
        </>
    );
}

export default Character;