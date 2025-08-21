import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import * as THREE from 'three';
import PmxModel from "./PMXModel";
import { ThreeEvent } from "@react-three/fiber";
import Morph from "./helper/Morph";
import Material from "./helper/Material";
import Physics from "./helper/Physics";
import Animation from "./helper/Animation";

function Model({ id, fileName, motionName = null, enableMorph = true, enableMaterial = true, enablePhysics = true }: { id: string, fileName: string, enableMorph?: boolean, enableMaterial?: boolean, enablePhysics?: boolean, motionName?: string }) {
    const pmxFiles = usePresetStore(state => state.pmxFiles)
    const url = pmxFiles.models[fileName]
    const folderName = fileName.split("/")[0]
    const models = useGlobalStore(state => state.models)

    return (
        <PmxModel
            name={id}
            url={url}
            modelTextures={pmxFiles.modelTextures[folderName]}
            castShadow={true}
            onCreate={(mesh: THREE.SkinnedMesh) => {
                const newModels = { ...models }
                newModels[id] = mesh
                useGlobalStore.setState({ models: newModels })
            }}
            onDispose={() => {
                const newModels = { ...models }
                delete newModels[id]
                useGlobalStore.setState({ models: newModels })
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
            {motionName && <Animation motionName={motionName} />}
        </PmxModel>
    );
}

export default Model;