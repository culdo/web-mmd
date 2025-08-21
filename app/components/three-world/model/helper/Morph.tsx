import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore, { PresetState } from "@/app/stores/usePresetStore";
import { setLevaValue } from "@/app/utils/gui";
import { useControls } from "leva";
import { Schema } from "leva/dist/declarations/src/types";
import { useEffect, useState } from "react";
import { useModel } from "./ModelContext";
import isRenderGui from "./useRenderGui";

function Morph() {
    const model = useModel()

    const [controllers, setControllers] = useState<Schema>({})

    const updateMorphFolder = () => {
        const newControllers: Schema = {}
        for (const key in model.morphTargetDictionary) {
            newControllers[key] = {
                value: 0,
                min: 0,
                max: 1,
                onChange: (value) => {
                    model.morphTargetInfluences[model.morphTargetDictionary[key]] = value;
                }
            }

        }
        setControllers(newControllers)
    }

    useEffect(() => {
        updateMorphFolder();
    }, [])

    useControls(`Model-${model.name}.Morphs`,
        () => controllers,
        { collapsed: true, render: () => isRenderGui(model.name) }, [controllers]
    )

    return <></>
}


export default Morph;