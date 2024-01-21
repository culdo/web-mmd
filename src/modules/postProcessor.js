import { BlendFunction, BloomEffect, EffectComposer, EffectPass, RenderPass, SelectiveBloomEffect } from 'postprocessing';
import { OutlinePass } from './effects/OutlinePass';
import { DepthOfFieldEffect } from './effects/DOFeffect';

class PostProcessor {
    constructor(scene, camera, renderer, api) {

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
            bokehScale: api["bokeh scale"],
            blendFunction: api["bokeh enabled"] ? BlendFunction.NORMAL : BlendFunction.SKIP
        })
        const dofPass = new EffectPass(camera, dofEffect);
        
        composer.addPass(renderPass)

        for (const [pass, key] of [
            [outlinePass, "show outline"], 
            [bloomPass, "bloom enabled"], 
            [dofPass, "bokeh enabled"]
        ]) {
            if(api[key]) {
                composer.addPass(pass)
            }
        }

        this.composer = composer;
        this.outline = outlinePass;

        this.bloomPass = bloomPass;
        this.bloomEffect = bloomEffect;

        this.dofPass = dofPass
        this.dofEffect = dofEffect;
    }
}

export { PostProcessor };
