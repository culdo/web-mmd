import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import * as THREE from 'three';
import PmxModel from "./PMXModel";
import { ThreeEvent } from "@react-three/fiber";
import Morph from "./helper/Morph";
import Material from "./helper/Material";
import Physics from "./helper/Physics";
import Animation from "./helper/Animation";

function Model({ id, fileName, motionNames = null, enableMorph = true, enableMaterial = true, enablePhysics = true }: { id: string, fileName: string, enableMorph?: boolean, enableMaterial?: boolean, enablePhysics?: boolean, motionNames?: string[] }) {
    const pmxFiles = usePresetStore(state => state.pmxFiles)
    const url = pmxFiles.models[fileName]
    const folderName = fileName.split("/")[0]

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
            {motionNames?.length > 0 && <Animation motionNames={motionNames} />}
        </PmxModel>
    );
}

export default Model;