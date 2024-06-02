import { EffectComposer } from "@react-three/postprocessing";
import OutlinePass from "./OutlinePass";
import ComposerEffect from "./ComposerEffect";

function Effects() {
    return (
        <EffectComposer>
            <ComposerEffect></ComposerEffect>
            <OutlinePass></OutlinePass>
        </EffectComposer>
    );
}

export default Effects;