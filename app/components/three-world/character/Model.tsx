import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { buildGuiItem, buildGuiObj, buildLoadFileFn, buildLoadModelFn } from "@/app/utils/gui";
import { button, folder, useControls } from "leva";
import * as THREE from 'three';
import PmxModel from "../pmx-model";
import { ThreeEvent } from "@react-three/fiber";
import WithReady from "@/app/stores/WithReady";
import { Helper } from "@react-three/drei";
import { SkeletonHelper } from "three";
import { CCDIKHelper } from "three/examples/jsm/Addons.js";
import { ReactNode } from "react";

function Model({ children }: { children: ReactNode }) {
    const characterName = usePresetStore(state => state.character)
    const motionName = usePresetStore(state => state.motion)
    const pmxFiles = usePresetStore(state => state.pmxFiles)
    const positionKey = "Character.position"
    const url = pmxFiles.character[characterName]
    const runtimeMesh = useGlobalStore(state => state.character)

    const [{
        position,
        "enable SDEF": enableSdef,
        "enable PBR": enablePBR,
        "self shadow": selfShadow,
        "show IK bones": showIkBones,
        "show skeleton": showSkeleton
    }, set] = useControls('Character', () => ({
        "model": {
            value: characterName,
            options: Object.keys(pmxFiles.character),
            onChange: (value, path, options) => {
                if (!options.initial) {
                    usePresetStore.setState({ character: value })
                } else {
                    set({model: characterName})
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
        "debug": folder({
            ...buildGuiObj("enable SDEF"),
            ...buildGuiObj("enable PBR"),
            ...buildGuiObj("self shadow"),
            ...buildGuiObj("show IK bones"),
            ...buildGuiObj("show skeleton"),
        }, { collapsed: true }),
    }), { collapsed: true, order: 2 }, [pmxFiles.character, motionName])

    return (
        <PmxModel
            name={positionKey}
            position={position}
            url={url}
            modelTextures={pmxFiles.modelTextures.character[characterName]}
            enableSdef={enableSdef}
            enablePBR={enablePBR}
            receiveShadow={selfShadow}
            castShadow={true}
            onCreate={(mesh: THREE.SkinnedMesh) => useGlobalStore.setState({
                character: mesh
            })}
            onDispose={() => useGlobalStore.setState({
                character: null
            })}
            onDoubleClick={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation()
                useGlobalStore.setState(({ selectedName: positionKey }))
            }}
            onPointerMissed={(e: Event) => {
                e.type === 'click' && useGlobalStore.setState({ selectedName: null })
            }}
        >
            <object3D name="smoothCenter"></object3D>
            {children}
            {showSkeleton && <Helper type={SkeletonHelper}></Helper>}
            {showIkBones && <Helper type={CCDIKHelper} args={[runtimeMesh?.geometry.userData.MMD.iks]}></Helper>}
        </PmxModel>
    );
}

export default WithReady(Model);