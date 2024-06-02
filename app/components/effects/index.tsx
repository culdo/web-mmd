import { EffectComposer } from "@react-three/postprocessing";
import OutlinePass from "./OutlinePass";

function Effects() {
    return (
        <EffectComposer>
            <OutlinePass></OutlinePass>
        </EffectComposer>
    );
}

export default Effects;