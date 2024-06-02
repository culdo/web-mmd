import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { useEffect } from "react";

function useMorph() {
    const { character } = useGlobalStore()
    const api: any = usePresetStore()

    const _buildOnChangeMorph = (key: string) => {
        return () =>
            character.morphTargetInfluences[character.morphTargetDictionary[key]] = api[key];
    }


    const updateMorphFolder = () => {
        for (const key in character.morphTargetDictionary) {
            if (!(key in api)) {
                api[key] = 0.0;
            }
            const onChangeMorph = _buildOnChangeMorph(key)
            onChangeMorph()
        }
        usePresetStore.setState(api)
    }
    useEffect(() => {
        updateMorphFolder();
    }, [character])
}

export default useMorph;