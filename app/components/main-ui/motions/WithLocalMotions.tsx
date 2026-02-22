import usePresetStore from "@/app/stores/usePresetStore";
import WithResourceNames from "../resources/WithResourceNames";

function useNames() {
    const motionFiles = usePresetStore(state => state.motionFiles)
    return Object.keys(motionFiles)
}

export default WithResourceNames(useNames);
