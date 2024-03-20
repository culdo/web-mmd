import { BlendFunction, BloomEffect, CopyMaterial, EffectComposer, EffectPass, RenderPass, SelectiveBloomEffect, ShaderPass } from 'postprocessing';
import { OutlinePass } from './effects/OutlinePass';
import { DepthOfFieldEffect } from './effects/DOFeffect';
import { Scene, Camera, WebGLRenderer, PerspectiveCamera } from 'three';

class PostProcessor {
    composer: EffectComposer;
    outline: OutlinePass;
    bloomPass: EffectPass;
    bloomEffect: SelectiveBloomEffect;
    dofPass: EffectPass;
    dofEffect: DepthOfFieldEffect;
    constructor(scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, api: { [x: string]: any; }) {

        const composer = new EffectComposer(renderer, {
            multisampling: Math.min(4, renderer.capabilities.maxSamples)
        });

        const renderPass = new RenderPass(scene, camera);
        const outlinePass = new OutlinePass(scene, camera, {
            enableSdef: api["enable SDEF"],
            enablePBR: api['enable PBR'],
        });

        const bloomEffect = new SelectiveBloomEffect(scene, camera, {
            luminanceThreshold: api["bloom threshold"],
            luminanceSmoothing: api["bloom smoothing"],
            mipmapBlur: true,
            intensity: api["bloom intensity"]
        })
        const bloomPass = new EffectPass(camera, bloomEffect);

        const dofEffect = new DepthOfFieldEffect(camera, {
            height: api["boken resolution"],
            worldFocusDistance: api["bokeh focus"],
            worldFocusRange: api["bokeh focal length"],
            bokehScale: api["bokeh scale"]
        })
        const dofPass = new EffectPass(camera, dofEffect);

        composer.addPass(renderPass)

        for (const [key, pass] of Object.entries({
            "show outline": outlinePass,
            "bloom enabled": bloomPass,
            "bokeh enabled": dofPass
        })
        ) {
            pass.enabled = api[key]
            composer.addPass(pass)
        }

        const outputPass = new ShaderPass(new CopyMaterial());
        composer.addPass(outputPass)

        this.composer = composer;
        this.outline = outlinePass;

        this.bloomPass = bloomPass;
        this.bloomEffect = bloomEffect;

        this.dofPass = dofPass
        this.dofEffect = dofEffect;
    }
}

export { PostProcessor };
