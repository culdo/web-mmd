import usePresetStore from "@/app/stores/usePresetStore";
import WithResourceNames from "../resources/WithResourceNames";

function useNames() {
    const pmxFiles = usePresetStore(state => state.pmxFiles)
    return Object.keys(pmxFiles.models)
}

export default WithResourceNames(useNames);