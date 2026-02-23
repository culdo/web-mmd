import usePresetStore from "@/app/stores/usePresetStore";


function useNames() {
    const motionFiles = usePresetStore(state => state.motionFiles)
    return Object.keys(motionFiles)
}

export default useNames;
