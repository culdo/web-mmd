import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useControls } from "leva";
import { useEffect, useRef, useState } from "react";
import OutlinePass from "./OutlinePass";
import EffectControls from "./controls";

import { DepthOfFieldEffect } from "@/app/modules/effects/DepthOfFieldEffect";
import { buildGuiItem } from "@/app/utils/gui";
import { useFrame, useThree } from "@react-three/fiber";
import { DepthOfField } from "./DepthOfField";
import { Vector3 } from "three";

function Effects() {
    const showOutline = usePresetStore(state => state["show outline"])

    const dofRef = useRef<DepthOfFieldEffect>()
    const character = useGlobalStore(state => state.character)
    const camera = useThree(state => state.camera)

    const dofConfig = useControls('Effects.DepthOfField', {
        enabled: buildGuiItem("bokeh enabled"),
        distance: {
            value: 0,
            min: 0,
            max: 1
        },
        focusRange: {
            ...buildGuiItem("bokeh focus range"),
            min: 0,
            max: 1
        },
        bokehScale: {
            ...buildGuiItem("bokeh scale"),
            min: 0,
            max: 50
        }
    }, { collapsed: true });

    const bloomConfig = useControls('Effects.Bloom', {
        enabled: buildGuiItem("bloom enabled"),
        intensity: {
            ...buildGuiItem("bloom intensity"),
            min: 0,
            max: 10
        },
        luminanceThreshold: {
            ...buildGuiItem("bloom threshold"),
            min: 0,
            max: 1
        },
        luminanceSmoothing: {
            ...buildGuiItem("bloom smoothing"),
            min: 0,
            max: 1
        },

    }, { collapsed: true });

    useFrame(() => {
        if(!dofRef.current) return
        if(!dofRef.current.target) {
            dofRef.current.target = new Vector3()
        }
        character.skeleton.getBoneByName("センター").getWorldPosition(dofRef.current.target)
    })
    
    return (
        <>
            <EffectComposer renderPriority={1}>
                <EffectControls></EffectControls>
                {showOutline && <OutlinePass></OutlinePass>}
                {bloomConfig.enabled && character && <Bloom mipmapBlur {...bloomConfig}></Bloom>}
                {dofConfig.enabled && character && <DepthOfField ref={dofRef} {...dofConfig}></DepthOfField>}
                
            </EffectComposer>
        </>
    );
}

export default Effects;