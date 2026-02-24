import useConfigStore from "@/app/stores/useConfigStore";

function useNames() {
    const pmxFiles = useConfigStore(state => state.pmxFiles)
    return Object.keys(pmxFiles.models)
}

export default useNames;