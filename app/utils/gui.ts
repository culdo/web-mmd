import { levaStore } from "leva";
import { OnChangeHandler } from "leva/dist/declarations/src/types";
import _ from "lodash";
import usePresetStore, { PresetState } from "../stores/usePresetStore";
import { blobToBase64 } from "./base";
import useGlobalStore from "../stores/useGlobalStore";
import * as THREE from "three";

function buildLoadModelFn(itemType: "character" | "stage") {

    return async function (event: Event) {
        const pmxFiles = usePresetStore.getState().pmxFiles;
        const modelTextures = pmxFiles.modelTextures

        const input = event.target as HTMLInputElement
        if (input.files.length < 1) return;
        let pmxFilesByType: any = pmxFiles[itemType] = {};
        let texFilesByType: any = modelTextures[itemType] = {};

        // load model and textures from unzipped folder
        let firstKey;
        const resourceMap: any = {};
        for (const f of input.files) {
            let relativePath = f.webkitRelativePath;
            const resourcePath = relativePath.split("/").slice(1).join("/").normalize()

            let url = await blobToBase64(f);

            // save model file
            if (f.name.includes(".pmx") || f.name.includes(".pmd")) {
                const modelName = f.name
                texFilesByType[modelName] = resourceMap;

                if (!firstKey) firstKey = modelName
                pmxFilesByType[modelName] = url;
                // save model textures
            } else {
                resourceMap[resourcePath] = url;
            }
        }
        usePresetStore.setState({ pmxFiles });

        if (itemType == "character") {
            usePresetStore.setState({ character: firstKey });
        } else if (itemType == "stage") {
            usePresetStore.setState({ stage: firstKey });
        }
    }
}

function buildLoadFileFn(cb: (file: string, name: string) => void) {
    return async function (event: Event) {
        const input = event.target as HTMLInputElement
        if (input.files.length < 1) return;
        cb(await blobToBase64(input.files[0]), input.files[0].name);
    }
}

function setLevaValue<T>(path: string, value: T) {
    levaStore.set({ [path]: value }, false)
}

// extract type from array type
type GuiValue<T> = T extends number[] ? [number, number, number] : T;

function buildGuiItem<const T extends keyof PresetState>(key: T, handler?: OnChangeHandler, min = 0, max = 1) {

    const initialValue = usePresetStore.getState()[key]

    const onChange: OnChangeHandler = (value, path, options) => {
        if (!options.initial) {
            usePresetStore.setState({ [key]: value })
        } else {
            value = initialValue
            setLevaValue(path, initialValue)
        }
        if (handler) {
            handler(value, path, options)
        }
    }
    if(typeof initialValue == "number") {
        return {
            value: initialValue as GuiValue<typeof initialValue>,
            min,
            max,
            onChange,
            transient: false as const
        }
    } 
    return {
        value: initialValue as GuiValue<typeof initialValue>,
        onChange,
        transient: false as const
    }
}

function buildFlexGuiItem<T>(path: string, handler?: OnChangeHandler) {

    const initialValue = _.get(usePresetStore.getState(), path)

    const onChange: OnChangeHandler = (value, path, options) => {
        if (!options.initial) {
            usePresetStore.setState((prevState) => {
                _.set(prevState, path, value)
                return { ...prevState }
            })
        } else {
            value = initialValue
            setLevaValue(path, initialValue)
        }
        if (handler) {
            handler(value, path, options)
        }
    }
    return {
        value: initialValue as T,
        onChange,
        transient: false as const
    }
}

function buildMaterialGuiItem<T>(key: keyof THREE.MeshPhysicalMaterial | `userData.${string}`, handler?: OnChangeHandler, min = 0, max = 1) {
    const character = useGlobalStore.getState()["character"]
    const targetMaterialIdx = usePresetStore.getState()["targetMaterialIdx"]

    const materials = character.material as any[]

    const targetMaterial = materials[targetMaterialIdx]

    const configPath = `material.${targetMaterial.name}.${key}`

    const targetProp = _.get(targetMaterial, key)

    const initValFromMaterial = targetProp instanceof THREE.Color ? `#${targetProp.getHexString()}` : targetProp
    const initialValue = _.get(usePresetStore.getState(), configPath) ?? initValFromMaterial

    const onChange: OnChangeHandler = (value, path, options) => {
        if (!options.initial) {
            usePresetStore.setState((prevState) => {
                _.set(prevState, configPath, value)
                return { ...prevState }
            })
        } else {
            value = initialValue
            setLevaValue(path, initialValue)
        }
        if (targetProp instanceof THREE.Color) {
            targetProp.set(value)
        } else {
            _.set(targetMaterial, key, value)
        }
        if (handler) {
            handler(value, path, options)
        }
    }
    if(typeof initialValue == "number") {
        return {
            value: initialValue as T,
            min,
            max,
            onChange,
            transient: false as const
        }
    } 
    return {
        value: initialValue as T,
        onChange,
        transient: false as const
    }
}


export { buildMaterialGuiItem, buildFlexGuiItem, buildGuiItem, buildLoadFileFn, buildLoadModelFn, setLevaValue };
