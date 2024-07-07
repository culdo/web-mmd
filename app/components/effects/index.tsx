import usePresetStore from "@/app/stores/usePresetStore";
import { Autofocus, AutofocusApi, Bloom, DepthOfField, EffectComposer, SelectiveBloom } from "@react-three/postprocessing";
import OutlinePass from "./OutlinePass";
import EffectControls from "./controls";
import CopyPass from "./CopyPass";
import { useEffect, useRef } from "react";
import { button, folder, useControls } from "leva";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { DepthOfFieldEffect } from "postprocessing";

function Effects() {
    const showOutline = usePresetStore(state => state["show outline"])

    const dofRef = useRef<DepthOfFieldEffect>()
    const character = useGlobalStore(state => state.character)

    const dofConfig = useControls('Effects.DepthOfField', {
        enabled: {
            value: false,
        },
        focusRange: { min: 0, max: 1, value: 0.02 },
        bokehScale: { min: 0, max: 50, value: 8 },
        width: { value: 512, min: 256, max: 2048, step: 256, optional: true, disabled: true },
        height: { value: 512, min: 256, max: 2048, step: 256, optional: true, disabled: true }

    }, { collapsed: true });

    const bloomConfig = useControls('Effects.Bloom', {
        enabled: {
            value: false,
        },
        intensity: { min: 0, max: 10, value: 1.0 },
        luminanceThreshold: { min: 0, max: 1, value: 1.0 },
        luminanceSmoothing: { min: 0, max: 1, value: 0.025 },

    }, { collapsed: true });

    useEffect(() => {
        if (!character || !dofRef.current) return
        dofRef.current.target = character.getObjectByName("smoothCenter").position
    }, [character, dofConfig.enabled])


    return (
        <>
            <EffectComposer renderPriority={1}>
                <EffectControls></EffectControls>
                {showOutline && <OutlinePass></OutlinePass>}
                {dofConfig.enabled && <DepthOfField ref={dofRef} {...dofConfig}></DepthOfField>}
                {bloomConfig.enabled && <Bloom mipmapBlur {...bloomConfig}></Bloom>}
                <CopyPass></CopyPass>
            </EffectComposer>
        </>
    );
}

export default Effects;