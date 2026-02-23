import usePresetStore from "@/app/stores/usePresetStore";


function useNames() {
    const pmxFiles = usePresetStore(state => state.pmxFiles)
    return Object.keys(pmxFiles.models)
}

export default useNames;