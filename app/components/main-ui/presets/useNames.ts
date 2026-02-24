import useConfigStore from "@/app/stores/useConfigStore";

export function useNames() {
    const presetList = useConfigStore(state => state.presetsList)
    return presetList
}

export default useNames;