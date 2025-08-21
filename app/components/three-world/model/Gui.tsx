import { button, useControls } from "leva";
import usePresetStore from "@/app/stores/usePresetStore";
import { buildGuiItem, loadFile, loadModel } from "@/app/utils/gui";
import { useEffect } from "react";

function Gui() {
    const models = usePresetStore(state => state.models)
    const pmxFiles = usePresetStore(state => state.pmxFiles)
    const targetModelId = usePresetStore(state => state.targetModelId)

    const targetOptions = Object.keys(models)

    const [_, setTargetId] = useControls(() => ({
        targetModelId: {
            ...buildGuiItem("targetModelId"),
            options: targetOptions
        },
        "add new model": button(() => {
            loadModel(true)
        })
    }), [targetOptions])

    useEffect(() => {
        setTargetId({ targetModelId })
    }, [targetModelId])

    const { fileName, motionName } = models[targetModelId]
    const modelsOption = Object.keys(pmxFiles.models)

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
        "motion name": {
            value: motionName,
            editable: false
        },
        "select motion file": button(() => {
            loadFile((motionFile, motionName) => {
                usePresetStore.setState(({ models, motionFiles }) => {
                    models[targetModelId].motionName = motionName
                    motionFiles[motionName] = motionFile
                    return {
                        models: { ...models },
                        motionFiles: { ...motionFiles }
                    }
                })
                set({ "motion name": motionName })
            })
        }),
        "enable physics": {
            value: true
        }
    }), { order: 2 }, [modelsOption, motionName, targetModelId])

    return <></>;
}

export default Gui;