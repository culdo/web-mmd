import useGlobalStore from "@/app/stores/useGlobalStore";

function useMorph() {
    const { character, api } = useGlobalStore()
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
    }
    updateMorphFolder();
}

export default useMorph;