import useGlobalStore from "@/app/stores/useGlobalStore";
import { Leva } from "leva";
import usePreset from "./preset";

function Panel() {
    const gui = useGlobalStore(state => state.gui)
    usePreset()
    const presetReady = useGlobalStore(states => states.presetReady)
    const hidden = !presetReady || gui.hidden
    return (
        <Leva oneLineLabels {...gui} hidden={hidden}></Leva>
    );
}

export default Panel;