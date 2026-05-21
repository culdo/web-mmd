import { useControls } from "leva";
import { Schema } from "leva/dist/declarations/src/types";
import { useCallback, useEffect, useState } from "react";
import { useModel } from "./ModelContext";
import isRenderGui from "./useRenderGui";
import usePresetStore from "@/app/stores/usePresetStore";

function Morph() {
    const model = useModel()
    const morphs = usePresetStore(state => state.models)[model.name]?.morphs ?? {}
    const [controllers, setControllers] = useState<Schema>({})

    const updateMorphFolder = useCallback(() => {
        const newControllers: Schema = {}
        for (const key in model.morphTargetDictionary) {
            newControllers[key] = {
                value: morphs[key] ?? 0,
                min: 0,
                max: 1,
                onChange: (value, path, options) => {
                    model.morphTargetInfluences[model.morphTargetDictionary[key]] = value;
                    if(options.initial) return
                    usePresetStore.setState(({ models }) => {
                        const modelData = models[model.name]
                        if (!modelData.morphs) {
                            modelData.morphs = {}
                        }
                        modelData.morphs[key] = value
                        return {
                            models: { ...models }
                        }
                    })
                }
            }

        }
        setControllers(newControllers)
    }, [morphs])

    useEffect(() => {
        updateMorphFolder();
    }, [])

    useControls(`Model.${model.name}.Morphs`,
        () => controllers,
        { collapsed: true, render: () => isRenderGui(model.name) }, [controllers]
    )

    return <></>
}


export default Morph;