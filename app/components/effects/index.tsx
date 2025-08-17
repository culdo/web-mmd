import useGlobalStore from "@/app/stores/useGlobalStore";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useControls } from "leva";
import { useMemo, useState } from "react";
import OutlinePass from "./OutlinePass";

import { HexDofEffect } from "@/app/modules/effects/HexDofEffect";
import { buildGuiItem, buildGuiObj } from "@/app/utils/gui";
import { useFrame, useThree } from "@react-three/fiber";
import { DepthOfField } from "./DepthOfField";
import { FloatType, Texture, Vector3 } from "three";
import { TextureEffectComp } from "./TextureEffectComp";
import { ColorChannel } from "postprocessing";
import { WebGPURenderer } from "three/webgpu";
import WebGPUEffectComposer from "./WebGPUEffectComposer";

function Effects() {
    const [dof, setDof] = useState<HexDofEffect>()
    const character = useGlobalStore(state => state.character)

    const effectConfig = useControls('Effects', {
        ...buildGuiObj("show outline")
    }, { order: 2 })

    const debugTextures = useMemo(() => {
        if (!dof) return { None: null }
        const rts = [
            dof.renderTarget,
            dof.renderTargetBokehTemp,
            dof.renderTargetCoC,
            dof.renderTargetDepth,
            dof.renderTargetFar,
            dof.renderTargetFocusDistance,
            dof.renderTargetFocalBlurred,
            dof.renderTargetCoCNear,
        ]

        const obj: Record<string, Texture> = {
            None: null
        }
        for(const rt of rts) {
            for(const t of rt.textures) {
                obj[t.name] = t
            }
        }
        return obj
    }, [dof])

    const debugChannels = {
        r: [ColorChannel.RED],
        g: [ColorChannel.GREEN],
        b: [ColorChannel.BLUE],
        a: [ColorChannel.ALPHA],
        rgb: [ColorChannel.RED, ColorChannel.GREEN, ColorChannel.BLUE],
        rgba: [ColorChannel.RED, ColorChannel.GREEN, ColorChannel.BLUE, ColorChannel.ALPHA]
    } as {[k: string]: [number, number?, number?, number?]}

    const dofConfig = useControls('Effects.DepthOfField', {
        enabled: buildGuiItem("bokeh enabled"),
        distance: {
            value: 0,
            min: 0,
            max: 1
        },
        focalLength: {
            ...buildGuiItem("bokeh focal length", (value) => {
                if(!(dof instanceof HexDofEffect)) return
                dof.uniforms.get("mFocalLength").value = value
                dof.depthBokeh4XPass.fullscreenMaterial.uniforms.mFocalLength.value = value
            }),
            min: 1.0,
            max: 70.0
        },
        focusRange: {
            ...buildGuiItem("bokeh focus range", (value) => {
                if(!(dof instanceof HexDofEffect)) return
                dof.uniforms.get("mFocalRegion").value = value
                dof.depthBokeh4XPass.fullscreenMaterial.uniforms.mFocalRegion.value = value
            }),
            min: 0.5,
            max: 5.0
        },
        fStop: {
            ...buildGuiItem("bokeh fStop", (value) => {
                if(!(dof instanceof HexDofEffect)) return
                dof.uniforms.get("mFstop").value = value
                dof.depthBokeh4XPass.fullscreenMaterial.uniforms.mFstop.value = value
            }),
            min: 1.0,
            max: 8.0
        },
        hexDof: true,
        TestMode: {
            value: 0.0,
            min: 0.0,
            max: 1.0,
            onChange: (val) => {
                if(!dof) return
                dof.uniforms.get("mTestMode").value = val
            }
        },
        MeasureMode: {
            value: 0.0,
            min: 0.0,
            max: 1.0,
            onChange: (val) => {
                if(!dof) return
                dof.uniforms.get("mMeasureMode").value = val
            }
        },
        debugTexture: {
            value: debugTextures["None"],
            options: debugTextures
        },
        debugChannel: {
            value: debugChannels.rgba,
            options: debugChannels
        }
    }, { collapsed: true }, [debugTextures]);

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
        if (!dof) return
        if (!dof.target) {
            dof.target = new Vector3()
        }
        character.skeleton.getBoneByName("センター").getWorldPosition(dof.target)
    })

    const renderer = useThree(state => state.gl)
    const isWebGPU = renderer instanceof WebGPURenderer

    if (isWebGPU) {
        return <WebGPUEffectComposer></WebGPUEffectComposer>
    } else {
        return (
            <EffectComposer renderPriority={3} frameBufferType={FloatType}>
                {effectConfig["show outline"] && <OutlinePass></OutlinePass>}
                {dofConfig.enabled && character && <DepthOfField ref={setDof}></DepthOfField>}
                {bloomConfig.enabled && character && <Bloom mipmapBlur {...bloomConfig}></Bloom>}
                {dofConfig.debugTexture && <TextureEffectComp texture={dofConfig.debugTexture} colorChannel={dofConfig.debugChannel} ></TextureEffectComp>}
            </EffectComposer>
        );
    }
}

export default Effects;