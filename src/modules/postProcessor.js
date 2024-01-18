import { OutlinePass } from './effects/OutlinePass';
import { BokehPass } from './effects/BokehPass';
import { OutputPass } from './effects/OutputPass';
import { RenderPass, EffectComposer, BloomEffect, EffectPass, DepthOfFieldEffect } from 'postprocessing';

class PostProcessor {
    constructor(scene, camera, renderer, parameters={}) {

        const composer = new EffectComposer(renderer);

        const renderPass = new RenderPass(scene, camera);
        const outlinePass = new OutlinePass(scene, camera, parameters);
        const effectPass = new EffectPass(camera, new BloomEffect(), new DepthOfFieldEffect());

        for (const pass of [renderPass, outlinePass, effectPass]) {
            composer.addPass(pass)
        }

        this.composer = composer;
        this.outline = outlinePass;
        this.effects = effectPass;
    }
}

export { PostProcessor }