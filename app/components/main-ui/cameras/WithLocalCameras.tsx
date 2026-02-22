import usePresetStore from "@/app/stores/usePresetStore";
import WithResourceNames from "../resources/WithResourceNames";

function useNames() {
    const cameraName = usePresetStore(state => state.camera)
    return [cameraName]
}
export default WithResourceNames(useNames);