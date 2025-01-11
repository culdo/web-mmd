import { use } from "react";
import useGlobalStore from "./useGlobalStore";

function usePresetReady() {
    const presetReadyPromise = useGlobalStore(state => state.presetReadyPromise)
    use(presetReadyPromise)
}

export default usePresetReady;