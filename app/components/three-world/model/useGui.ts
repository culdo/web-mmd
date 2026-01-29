import { button, useControls } from "leva";
import usePresetStore from "@/app/stores/usePresetStore";
import { loadFile, loadModel } from "@/app/utils/gui";

function useGui(id: string) {
    const models = usePresetStore(state => state.models)
    const pmxFiles = usePresetStore(state => state.pmxFiles)
    const motionFiles = usePresetStore(state => state.motionFiles)

    const { fileName, motionNames, enableMorph, enableMaterial, enablePhysics } = models[id]
    const modelsOption = Object.keys(pmxFiles.models)
    const blendOptions = Object.keys(motionFiles).filter(val => !motionNames.includes(val))

    const isRenderHelper = (enabled: boolean) => ({
        value: enabled,
        render: (get: (key: string) => any) => get(`Model.${id}.enabled`)
    })

    const [controller, set] = useControls(`Model.${id}`, () => ({
        "model": {
            value: fileName,
            options: modelsOption,
            onChange: (value, path, options) => {
                if (!options.initial) {
                    const { models } = usePresetStore.getState()
                    const newModels = { ...models }
                    newModels[id].fileName = value
                    usePresetStore.setState({ models: newModels })
                } else {
                    set({ model: fileName })
                }
            },
        },
        "select model folder": button(() => {
            loadModel()
        }),
        "delete": button(() => {
            usePresetStore.setState(({ models }) => {
                delete models[id]
                const newTargetModelId = Object.keys(models)[0]
                return { models: { ...models }, targetModelId: newTargetModelId }
            })
        }),
        "add motion file": button(() => {
            loadFile((motionFile, motionName) => {
                usePresetStore.setState(({ models, motionFiles }) => {
                    motionFiles[motionName] = motionFile
                    models[id].motionNames[0] = motionName
                    return {
                        motionFiles: { ...motionFiles },
                        models: { ...models }
                    }
                })
            })
        }),
        "blend motion": {
            value: "Select...",
            options: blendOptions,
            onChange: (val, path, options) => {
                if (options.initial || val == "Select...") return
                usePresetStore.setState(({ models }) => {
                    const { motionNames } = models[id]
                    if (!motionNames.includes(val)) {
                        motionNames.push(val)
                    }
                    return {
                        models: { ...models }
                    }
                })
                set({ "blend motion": "Select..." })
            }
        },
        "enabled": true,
        "enableMorph": isRenderHelper(enableMorph),
        "enableMaterial": isRenderHelper(enableMaterial),
        "enablePhysics": isRenderHelper(enablePhysics),
        "enableAnimation": isRenderHelper(true)
    }), { order: 2, render: (get) => get("Model.target model") == id }, [modelsOption, blendOptions])

    return controller;
}

export default useGui;