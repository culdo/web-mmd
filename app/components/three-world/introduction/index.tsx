import { useControls } from "leva";
import Scene from "./scene";
import { buildGuiItem } from "@/app/utils/gui";

function Introduction() {
    const { enabled } = useControls("Introduction", {
        enabled: buildGuiItem("introEnabled")
    }, { order: 5 })
    return enabled && <Scene></Scene>;
}

export default Introduction;

