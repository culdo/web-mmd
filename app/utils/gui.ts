import { levaStore } from "leva";
import { InputOptions, OnChangeHandler, Schema } from "leva/dist/declarations/src/types";
import _ from "lodash";
import usePresetStore, { PresetState } from "../stores/usePresetStore";
import { blobToBase64 } from "./base";
import * as THREE from "three";
import { randomBytes } from "crypto";
import { nanoid } from "nanoid";

function loadModel(add=false) {
    const selectFile = document.getElementById("selectFile") as HTMLInputElement
    selectFile.webkitdirectory = true;
    selectFile.onchange = async function (event: Event) {
        const { pmxFiles, targetModelId, motionFiles } = usePresetStore.getState();
        const modelTextures = pmxFiles.modelTextures

        const input = event.target as HTMLInputElement
        if (input.files.length < 1) return;

        // load model and textures from unzipped folder
        let firstId: string;
        let firstModelname: string;

        for (const f of input.files) {
            const base64data = await blobToBase64(f);

            // save model file
            if (f.name.includes(".pmx") || f.name.includes(".pmd")) {
                const modelName = f.webkitRelativePath
                if (!firstId) {
                    firstId = `${f.name.split(".")[0]}-${nanoid(5)}`
                    firstModelname = modelName
                }
                pmxFiles.models[modelName] = base64data;

                // save model textures
            } else {
                const pathArr = f.webkitRelativePath.split("/")
                const folderName = pathArr[0]
                const resourcePath = pathArr.slice(1).join("/").normalize()
                if (!modelTextures[folderName]) {
                    modelTextures[folderName] = {}
                }
                modelTextures[folderName][resourcePath] = base64data;
            }
        }
        usePresetStore.setState({ pmxFiles: { ...pmxFiles } });

        if (add) {
            usePresetStore.setState({ targetModelId: firstId })
        }

        usePresetStore.setState(({ models }) => {
            const newModels = { ...models }
            if(add) {
                newModels[firstId] = {
                    fileName: firstModelname,
                    motionName: Object.entries(motionFiles)[0][0],
                    enableMaterial: true,
                    enableMorph: true,
                    enablePhysics: true
                }
            } else {
                newModels[targetModelId].fileName = firstModelname
            }
            return { models: newModels }
        })

        // clear
        input.webkitdirectory = false
    }
    selectFile.click();
}

function loadFile(cb: (file: string, name: string) => void) {
    const selectFile = document.getElementById("selectFile") as HTMLInputElement
    selectFile.onchange = async function (event: Event) {
        const input = event.target as HTMLInputElement
        if (input.files.length < 1) return;
        cb(await blobToBase64(input.files[0]), input.files[0].name);
    }
    selectFile.click();
}

function setLevaValue<T>(path: string, value: T) {
    levaStore.set({ [path]: value }, false)
}

// extract type from array type
type GuiValue<T> = T extends number[] ? [number, number, number] : T;

function buildGuiFunc(defaultOptions?: InputOptions) {
    return function buildGuiItem<const T extends keyof PresetState>(key: T, handler?: OnChangeHandler, options?: InputOptions) {

        const initialValue = usePresetStore.getState()[key]

        const onChange: OnChangeHandler = (value, path, options) => {

            if (!options.initial) {
                usePresetStore.setState({ [key]: value })
            } else {
                value = initialValue

                const init = () => {
                    const initialValue = usePresetStore.getState()[key]
                    setLevaValue(path, initialValue)
                }
                usePresetStore.persist.onFinishHydration(init)
            }
            if (handler) {
                handler(value, path, options)
            }
        }
        return {
            value: initialValue,
            onChange,
            transient: false,
            ...defaultOptions,
            ...options,
            disabled: defaultOptions?.disabled || options?.disabled
        } as { value: GuiValue<PresetState[T]> } & InputOptions
    }
}

const buildGuiItem = buildGuiFunc()

function buildGuiObj<const T extends keyof PresetState>(key: T, options?: InputOptions) {
    return {
        [key]: {
            ...buildGuiItem(key, options?.onChange, options)
        }
    } as {
            [key in T]: ReturnType<typeof buildGuiItem<T>>
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

function buildMaterialGuiFunc(targetModel: THREE.SkinnedMesh, targetMaterialIdx: number) {
    return function buildMaterialGuiItem<const T extends keyof THREE.MeshPhysicalMaterial | `userData.${string}`>(key: T, handlerOrArgs?: OnChangeHandler | readonly [OnChangeHandler, Record<string, any>], min = 0, max = 1) {

        const materials = targetModel.material as any[]

        const targetMaterial = materials[targetMaterialIdx]

        const configPath = `materials.${targetModel.name}.${targetMaterial.name}.${key}`

        const targetProp = _.get(targetMaterial, key)

        const initValFromMaterial = targetProp instanceof THREE.Color ? `#${targetProp.getHexString()}` : targetProp
        const initialValue = _.get(usePresetStore.getState(), configPath) ?? initValFromMaterial

        let handler: OnChangeHandler;
        let options: Record<string, any>;
        if (Array.isArray(handlerOrArgs)) {
            [handler, options] = handlerOrArgs
        } else if (typeof handlerOrArgs == "function") {
            handler = handlerOrArgs
        }

        const onChange: OnChangeHandler = (value, path, context) => {
            if (!context.initial) {
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
                handler(value, path, context)
            }
        }
        if (typeof initialValue == "number") {
            return {
                value: initialValue,
                min,
                max,
                onChange,
                transient: false as const
            }
        }
        if (options) {
            return {
                value: initialValue,
                onChange,
                transient: false as const,
                options
            }
        }
        return {
            value: initialValue,
            onChange,
            transient: false as const
        }
    }
}


export { buildMaterialGuiFunc, buildFlexGuiItem, buildGuiFunc, buildGuiItem, buildGuiObj, loadFile, loadModel, setLevaValue };
