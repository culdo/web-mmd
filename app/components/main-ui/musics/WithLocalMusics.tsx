import usePresetStore from "@/app/stores/usePresetStore";
import WithResourceNames from "../resources/WithResourceNames";

function useNames() {
    const musicName = usePresetStore(state => state.musicName)
    return [musicName]
}

export default WithResourceNames(useNames);