import useGlobalStore from "@/app/stores/useGlobalStore";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useControls } from "leva";
import { useEffect, useState } from "react";
import OutlinePass from "./OutlinePass";

import { DepthOfFieldEffect } from "@/app/modules/effects/DepthOfFieldEffect";
import { buildGuiItem, buildGuiObj } from "@/app/utils/gui";
import { useFrame } from "@react-three/fiber";
import { DepthOfField } from "./DepthOfField";
import { Texture, Vector3 } from "three";
import { TextureEffectComp } from "./TextureEffectComp";
import { ColorChannel } from "postprocessing";

function Effects() {
    const [dof, setDof] = useState<DepthOfFieldEffect>()
    const [depthDebugColor, setDepthDebugColor] = useState<[number, number?, number?, number?]>()
    const [depthTexture, setDepthTexture] = useState<Texture>()
    const character = useGlobalStore(state => state.character)

    const effectConfig = useControls('Effects', {
        ...buildGuiObj("show outline")
    }, {order: 2})
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
        },
        depthDebug: buildGuiItem("texture enabled")
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
        if(!dof) return
        if(!dof.target) {
            dof.target = new Vector3()
        }
        character.skeleton.getBoneByName("センター").getWorldPosition(dof.target)
    })

    useEffect(() => {
        if(!dof || !dofConfig.depthDebug) return
        setDepthTexture(dof.renderTargetDepth.texture)
        setDepthDebugColor([ColorChannel.RED])
        return () => setDepthTexture(null)
    }, [dof, dofConfig.depthDebug])
    
    return (
        <>
            <EffectComposer renderPriority={3}>
                {effectConfig["show outline"] && <OutlinePass></OutlinePass>}
                {bloomConfig.enabled && character && <Bloom mipmapBlur {...bloomConfig}></Bloom>}
                {dofConfig.enabled && character && <DepthOfField ref={setDof} {...dofConfig}></DepthOfField>}
                {depthTexture && <TextureEffectComp texture={depthTexture} colorChannel={depthDebugColor} ></TextureEffectComp>}
            </EffectComposer>
        </>
    );
}

export default Effects;