import usePresetStore from "@/app/stores/usePresetStore";

function useNames() {
    const musicName = usePresetStore(state => state.musicName)
    return [musicName]
}

export default useNames;