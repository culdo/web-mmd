import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { useControls } from "leva";
import { Schema } from "leva/dist/declarations/src/types";
import { useEffect, useState } from "react";

function Morph() {
    const character = useGlobalStore(state => state.character)
    const morphs: any = usePresetStore(state => state.morphs)

    const buildOnChangeMorph = (key: string) => {
        return (value: number) =>
            character.morphTargetInfluences[character.morphTargetDictionary[key]] = value;
    }


    const [controllers, setControllers] = useState<Schema>({})

    const updateMorphFolder = () => {
        const newControllers: Schema = {}
        for (const key in character.morphTargetDictionary) {
            if (!(key in morphs)) {
                morphs[key] = 0.0;
            }
            const onChangeMorph = buildOnChangeMorph(key)
            newControllers[key] = {
                value: morphs[key],
                onChange: (value, path, context) => {
                    onChangeMorph(value)
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
        usePresetStore.setState({ morphs })
    }

    useControls("Morphs", controllers, {collapsed: true}, [controllers])
    useEffect(() => {
        if (!character) return
        updateMorphFolder();
    }, [character])

    return <></>
}

export default Morph;