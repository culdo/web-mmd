import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import * as THREE from 'three';
import PmxModel from "./PMXModel";
import { ThreeEvent } from "@react-three/fiber";
import { RunModes } from "../run-mode";
import dynamic from "next/dynamic";
const Morph = dynamic(() => import('./helper/Morph'), { ssr: false })
const Material = dynamic(() => import('./helper/Material'), { ssr: false })
const Physics = dynamic(() => import("./helper/Physics"), { ssr: false })
const Animation = dynamic(() => import("./helper/Animation"), { ssr: false })

function Model({ id, fileName, motionNames = [], enableMorph = true, enableMaterial = true, enablePhysics = true }: { id: string, fileName: string, enableMorph?: boolean, enableMaterial?: boolean, enablePhysics?: boolean, motionNames?: string[] }) {
    const pmxFiles = usePresetStore(state => state.pmxFiles)
    const runMode = usePresetStore(state => state["run mode"])
    const targetModelId = usePresetStore(state => state.targetModelId)
    const url = pmxFiles.models[fileName]
    const folderName = fileName.split("/")[0]
    const enableAnimation = motionNames?.length > 0 && (runMode == RunModes.PLAYER_MODE || targetModelId != id)
    return (
        <PmxModel
            name={id}
            url={url}
            modelTextures={pmxFiles.modelTextures[folderName]}
            castShadow={true}
            onCreate={(mesh: THREE.SkinnedMesh) => {
                useGlobalStore.setState(({ models }) => {
                    models[id] = mesh
                    return { models: { ...models } }
                })
            }}
            onDispose={() => {
                useGlobalStore.setState(({ models }) => {
                    delete models[id]
                    return { models: { ...models } }
                })
            }}
            onDoubleClick={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation()
                useGlobalStore.setState(({ selectedName: id }))
            }}
            onPointerMissed={(e: Event) => {
                e.type === 'click' && useGlobalStore.setState({ selectedName: null })
            }}
        >
            <object3D name="smoothCenter"></object3D>
            {enableMorph && <Morph />}
            {enableMaterial && <Material />}
            {enablePhysics && <Physics />}
            {enableAnimation && <Animation motionNames={motionNames} />}
        </PmxModel>
    );
}

export default Model;