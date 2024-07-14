import useConfigStore from "@/app/stores/useConfigStore";
import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore, { PresetState } from "@/app/stores/usePresetStore";
import { setLevaValue } from "@/app/utils/gui";
import { button, levaStore, useControls } from "leva";
import { Schema } from "leva/dist/declarations/src/types";
import { useEffect, useState } from "react";

function Morph() {
    const character = useGlobalStore(state => state.character)
    const presetReady = useGlobalStore(state => state.presetReady)

    const morphs: Record<string, number> = usePresetStore(state => state.morphs)

    const [controllers, setControllers] = useState<Schema>({})

    const updateMorphFolder = () => {
        const newControllers: Schema = {}
        for (const key in character.morphTargetDictionary) {
            if (!(key in morphs)) {
                morphs[key] = 0.0;
            }
            newControllers[key] = {
                value: morphs[key],
                min: 0,
                max: 1,
                onChange: (value: number, path, context) => {
                    if (!context.initial) {
                        usePresetStore.setState(({ morphs }) => {
                            morphs[key as keyof PresetState["morphs"]] = value
                            return { morphs }
                        })
                    } else {
                        value = morphs[key]
                        setLevaValue(path, value)
                    }
                    character.morphTargetInfluences[character.morphTargetDictionary[key]] = value;
                }
            }

        }
        //clear unused keys
        for (const key in morphs) {
            if (!(key in character.morphTargetDictionary)) {
                delete morphs[key]
            }
        }
        setControllers(newControllers)
        usePresetStore.setState({ morphs } as any)
    }

    const [_, setGui] = useControls("Morphs", () => controllers, { collapsed: true }, [controllers])

    useEffect(() => {
        if (!presetReady || !character) return
        updateMorphFolder();
    }, [presetReady, character])

    return <></>
}

export default Morph;