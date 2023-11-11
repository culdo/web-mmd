import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { OutlinePass } from './effects/OutlinePass';
import { BokehPass } from './effects/BokehPass';
import { EffectComposer } from './effects/EffectComposer';

class PostProcessor {
    constructor(scene, camera, renderer, parameters={}) {

        const composer = new EffectComposer(renderer);

        const renderPass = new RenderPass(scene, camera);
        const outlinePass = new OutlinePass(scene, camera, parameters);
        const bokehPass = new BokehPass(scene, camera, parameters);

        for (const pass of [renderPass, outlinePass, bokehPass]) {
            composer.addPass(pass)
        }

        this.composer = composer;
        this.outline = outlinePass;
        this.bokeh = bokehPass;
    }
}

export { PostProcessor }