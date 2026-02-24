import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import * as THREE from 'three';
import PmxModel from "./PMXModel";
import { ThreeEvent } from "@react-three/fiber";
import { RunModes } from "../run-modes";
import dynamic from "next/dynamic";
import { button, useControls } from "leva";
import useConfigStore from "@/app/stores/useConfigStore";
const Morph = dynamic(() => import('./helper/Morph'), { ssr: false })
const Material = dynamic(() => import('./helper/Material'), { ssr: false })
const Physics = dynamic(() => import("./helper/Physics"), { ssr: false })
const Animation = dynamic(() => import("./helper/Animation"), { ssr: false })

function Model({ id, fileName, motionNames = [], enableMorph = true, enableMaterial = true, enablePhysics = true }: { id: string, fileName: string, enableMorph?: boolean, enableMaterial?: boolean, enablePhysics?: boolean, motionNames?: string[] }) {
    const pmxFiles = useConfigStore(state => state.pmxFiles)
    const runMode = usePresetStore(state => state["run mode"])
    const targetModelId = usePresetStore(state => state.targetModelId)
    const url = pmxFiles.models[fileName]
    const folderName = fileName.split("/")[0]
    const enableAnimation = motionNames.length > 0 && (
        runMode == RunModes.PLAYER_MODE ||
        runMode == RunModes.INTRO_MODE ||
        targetModelId != id
    )
    const modelsObject = useGlobalStore(state => state.modelsObject)

    const modelsOption = Object.keys(pmxFiles.models)
    const isRenderHelper = (enabled: boolean) => ({
        value: enabled,
        render: (get: (key: string) => any) => get(`Model.${id}.enabled`)
    })

    const [controller, set] = useControls(`Model.${id}`, () => ({
        "variant": {
            value: fileName,
            options: modelsOption,
            onChange: (value, path, options) => {
                if (!options.initial) {
                    const { models } = usePresetStore.getState()
                    const newModels = { ...models }
                    newModels[id].fileName = value
                    usePresetStore.setState({ models: newModels })
                } else {
                    set({ variant: fileName })
                }
            },
        },
        "delete": button(() => {
            usePresetStore.setState(({ models }) => {
                delete models[id]
                const newTargetModelId = Object.keys(models)[0]
                return { models: { ...models }, targetModelId: newTargetModelId }
            })
        }),
        "enabled": true,
        "enableMorph": isRenderHelper(enableMorph),
        "enableMaterial": isRenderHelper(enableMaterial),
        "enablePhysics": isRenderHelper(enablePhysics),
        "enableAnimation": isRenderHelper(true)
    }), { order: 2, render: (get) => get("Model.target model") == id }, [modelsOption])

    if (!controller.enabled) return null;

    return (
        <PmxModel
            name={id}
            url={url}
            modelTextures={pmxFiles.modelTextures[folderName]}
            castShadow={true}
            receiveShadow={true}
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
            {controller.enableMorph && <Morph />}
            {controller.enableMaterial && <Material />}
            {controller.enablePhysics && <Physics />}
            {enableAnimation && controller.enableAnimation && <Animation motionNames={motionNames} />}
            {modelsObject[id]}
        </PmxModel>
    );
}

export default Model;