import useConfigStore from "@/app/stores/useConfigStore";

function useNames() {
    const motionFiles = useConfigStore(state => state.motionFiles)
    return Object.keys(motionFiles)
}

export default useNames;
