import { OutlinePass as OutlinePassImpl } from "@/app/modules/effects/OutlinePass";
import { useThree } from "@react-three/fiber";
import { Suspense } from "react";
import usePresetStore from "@/app/stores/usePresetStore";

function OutlinePass() {
    const { scene, camera } = useThree()
    const enableSdef = usePresetStore(state => state["enable SDEF"])
    const enablePBR = usePresetStore(state => state["enable PBR"])

    const outlinePass = new OutlinePassImpl(scene, camera, {
        enableSdef,
        enablePBR
    })
    return (
        <Suspense fallback={null} >
            {outlinePass ? <primitive object={outlinePass} dispose={null} /> : null
            }
        </Suspense>
    );
}

export default OutlinePass;
