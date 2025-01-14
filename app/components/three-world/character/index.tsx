import useGlobalStore, { GlobalState } from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { disposeMesh, onProgress } from "@/app/utils/base";
import { buildGuiItem, buildLoadFileFn, buildLoadModelFn } from "@/app/utils/gui";
import { useThree } from "@react-three/fiber";
import { button, useControls } from "leva";
import path from "path-browserify";
import { useEffect, useRef, useState } from "react";
import * as THREE from 'three';
import ModelController from "../ModelController";
import Pose from "./Pose";
import WithSuspense from "../../suspense";
import usePresetReady from "@/app/stores/usePresetReady";
import PmxModel from "../pmx-model";
import { MMDLoader } from "@/app/modules/MMDLoader";

function Character() {

    const { scene } = useThree()
    usePresetReady()
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
            set({ position: [0, 0, 0] })
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
    }), { collapsed: true, order: 2 }, [pmxFiles.character, motionName])

    const [onCreate, setOnCreate] = useState<(mesh: THREE.SkinnedMesh) => void>()
    const [props, setProps] = useState<Awaited<ReturnType<MMDLoader["loadAsync"]>>>()
    useEffect(() => {
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

        let resolve: (mesh: THREE.SkinnedMesh) => void;
        useGlobalStore.setState({
            characterPromise: new Promise(res => resolve = res)
        })
        setOnCreate(() => (mesh: THREE.SkinnedMesh) => {
            useGlobalStore.setState({
                character: mesh
            })
            resolve(mesh)
        })
        const init = async () => {
            const props = await loader
                .setModelParams(characterParams)
                .loadAsync(url, onProgress);
            setProps(props)
        }
        init()
        
    }, [url, characterName, enablePBR])

    const smoothCenterRef = useRef()
    return (
        <>
            <PmxModel
                name={positionKey}
                position={position}
                {...props}
                onCreate={onCreate}
                onDoubleClick={(e: Event) => {
                    e.stopPropagation()
                    useGlobalStore.setState(({ selectedName: positionKey }))
                }}
                onPointerMissed={(e: Event) => {
                    e.type === 'click' && useGlobalStore.setState({ selectedName: null })
                }}
            >
                <object3D ref={smoothCenterRef} name="smoothCenter"></object3D>
            </PmxModel>
            <Pose></Pose>
            <ModelController type="Character"></ModelController>
        </>
    );
}

export default WithSuspense(Character);