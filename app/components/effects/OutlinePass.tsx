import { OutlinePass as OutlinePassImpl } from "@/app/modules/effects/OutlinePass";
import { useThree } from "@react-three/fiber";
import { Suspense, useMemo } from "react";
import usePresetStore from "@/app/stores/usePresetStore";

function OutlinePass({ enabled = true }) {
    const scene = useThree(state => state.scene)
    const camera = useThree(state => state.camera)
    const enableSdef = usePresetStore(state => state["enable SDEF"])
    const enablePBR = usePresetStore(state => state["enable PBR"])

    const outlinePass = useMemo(() => new OutlinePassImpl(scene, camera, {
        enableSdef,
        enablePBR
    }), [scene, camera, enableSdef, enablePBR])
    return (
        <Suspense fallback={null} >
            {outlinePass ? <primitive object={outlinePass} dispose={null} enabled={enabled} /> : null}
        </Suspense>
    );
}

export default OutlinePass;
