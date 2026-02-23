import useConfigStore from "@/app/stores/useConfigStore";

export function usePresetsNames() {
    const presetList = useConfigStore(state => state.presetsList)
    return presetList
}

export default usePresetsNames;