import { BlendFunction, BloomEffect, DepthOfFieldEffect, EffectComposer, EffectPass, RenderPass } from 'postprocessing';
import { OutlinePass } from './effects/OutlinePass';

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

        const depthOfFieldEffect = new DepthOfFieldEffect(camera, {
            height: api["boken resolution"],
            worldFocusDistance: api["bokeh focal"],
            worldFocusRange: api["bokeh focal length"],
            bokehScale: api["bokeh scale"],
            blendFunction: api["bokeh enabled"] ? BlendFunction.NORMAL : BlendFunction.SKIP
        })

        const bloomEffect = new BloomEffect()

        const effectPass = new EffectPass(camera, bloomEffect, depthOfFieldEffect);

        for (const pass of [renderPass, outlinePass, effectPass]) {
            composer.addPass(pass)
        }

        this.composer = composer;
        this.outline = outlinePass;
        this.bloomEffect = bloomEffect;
        this.depthOfFieldEffect = depthOfFieldEffect;
    }
}

export { PostProcessor };
