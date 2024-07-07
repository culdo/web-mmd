import useGlobalStore from "@/app/stores/useGlobalStore";
import { Leva } from "leva";
import usePreset from "./preset";

function Panel() {
    const gui = useGlobalStore(state => state.gui)
    usePreset()
    return (
        <Leva oneLineLabels {...gui}></Leva>
    );
}

export default Panel;