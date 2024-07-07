import { EffectComposer } from "@react-three/postprocessing";
import OutlinePass from "./OutlinePass";
import EffectControls from "./controls";
import usePresetStore from "@/app/stores/usePresetStore";
import ShaderPass from "./ShaderPass";

function Effects() {
    const showOutline = usePresetStore(state => state["show outline"])
    return (
        <>
            <EffectComposer>
                <EffectControls></EffectControls>
                <OutlinePass enabled={showOutline}></OutlinePass>
                <ShaderPass></ShaderPass>
            </EffectComposer>
        </>
    );
}

export default Effects;