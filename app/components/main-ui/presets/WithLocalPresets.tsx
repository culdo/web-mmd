import useConfigStore from "@/app/stores/useConfigStore";
import WithResourceNames from "../resources/WithResourceNames";

function useNames() {
    const presetList = useConfigStore(state => state.presetsList)
    return presetList
}

export default WithResourceNames(useNames)