import { button, useControls } from "leva";
import usePresetStore from "@/app/stores/usePresetStore";
import { buildGuiItem, loadFile, loadModel } from "@/app/utils/gui";
import { useEffect } from "react";

function Gui() {
    const models = usePresetStore(state => state.models)
    const pmxFiles = usePresetStore(state => state.pmxFiles)
    const motionFiles = usePresetStore(state => state.motionFiles)
    const targetModelId = usePresetStore(state => state.targetModelId)

    const targetOptions = Object.keys(models)

    const [_, setTargetId] = useControls(() => ({
        "target model id": {
            ...buildGuiItem("targetModelId"),
            options: targetOptions
        },
        "add new model": button(() => {
            loadModel(true)
        })
    }), [targetOptions])

    useEffect(() => {
        setTargetId({ "target model id": targetModelId })
    }, [targetModelId])

    const { fileName, motionNames } = models[targetModelId]
    const modelsOption = Object.keys(pmxFiles.models)

    const blendOptions = Object.keys(motionFiles).filter(val => !motionNames.includes(val))
    const [, set] = useControls(`Model-${targetModelId}`, () => ({
        "model": {
            value: fileName,
            options: modelsOption,
            onChange: (value, path, options) => {
                if (!options.initial) {
                    const { models } = usePresetStore.getState()
                    const newModels = { ...models }
                    newModels[targetModelId].fileName = value
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
                delete models[targetModelId]
                const newTargetModelId = Object.keys(models)[0]
                return { models: { ...models }, targetModelId: newTargetModelId }
            })
        }),
        "add motion file": button(() => {
            loadFile((motionFile, motionName) => {
                usePresetStore.setState(({ models, motionFiles }) => {
                    motionFiles[motionName] = motionFile
                    models[targetModelId].motionNames[0] = motionName
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
                    const motionNames = models[targetModelId].motionNames
                    if (motionNames.includes(val)) return {}
                    motionNames.push(val)
                    return {
                        models: { ...models }
                    }
                })
                set({ "blend motion": "Select..." })
            }
        },
        "enable physics": {
            value: true
        }
    }), { order: 2 }, [modelsOption, blendOptions, targetModelId])

    return <></>;
}

export default Gui;