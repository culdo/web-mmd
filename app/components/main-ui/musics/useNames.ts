import useConfigStore from "@/app/stores/useConfigStore";

function useNames() {
    const audioFiles = useConfigStore(state => state.audioFiles)
    return Object.keys(audioFiles)
}

export default useNames;