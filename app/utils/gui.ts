import { levaStore } from "leva";
import { InputOptions, OnChangeHandler } from "leva/dist/declarations/src/types";
import _ from "lodash";
import usePresetStore, { PresetState } from "../stores/usePresetStore";
import { readFile as readFile } from "./base";
import * as THREE from "three";

function loadFile(cb: (file: string, name: string) => void, asBase64 = true) {
    const selectFile = document.getElementById("selectFile") as HTMLInputElement
    selectFile.onchange = async function (event: Event) {
        const input = event.target as HTMLInputElement
        if (input.files.length < 1) return;
        const data = await readFile(input.files[0], asBase64)
        cb(data, input.files[0].name);
    }
    selectFile.click();
}

function setLevaValue<T>(path: string, value: T) {
    levaStore.set({ [path]: value }, false)
}

// extract type from array type
type GuiValue<T> = T extends number[] ? [number, number, number] : T;

const _unSubscribers: Record<string, () => void> = {}
function buildGuiFunc(defaultOptions?: InputOptions) {
    return function buildGuiItem<const T extends keyof PresetState>(key: T, handler?: OnChangeHandler, options?: InputOptions) {

        const initialValue = usePresetStore.getState()[key]

        const onChange: OnChangeHandler = (value, path, options) => {
            if (!options.initial && options.fromPanel) {
                usePresetStore.setState({ [key]: value })
            } else {
                if (_unSubscribers[key]) {
                    _unSubscribers[key]()
                    delete _unSubscribers[key]
                }
                const unSubscriber = usePresetStore.subscribe(state => state[key], (val) => {
                    setLevaValue(path, val)
                })
                _unSubscribers[key] = unSubscriber
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
        [key]: buildGuiItem(key, options?.onChange, options)
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
                    if (!(value instanceof THREE.Texture)) {
                        _.set(prevState, configPath, value)
                    }
                    const { materials } = prevState
                    return { materials: { ...materials } }
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

const infoStyle = (started: boolean) => ({
    style: {
        backgroundColor: started ? 'green' : 'red',
    },
})


export { buildMaterialGuiFunc, buildFlexGuiItem, buildGuiFunc, buildGuiItem, buildGuiObj, loadFile, setLevaValue, infoStyle };
