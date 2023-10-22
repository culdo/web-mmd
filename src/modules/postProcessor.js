import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass';
import { OutlinePass } from './effects/OutlinePass';

class PostProcessor {
    constructor(scene, camera, renderer) {

        const composer = new EffectComposer(renderer);

        const renderPass = new RenderPass(scene, camera);
        const outlinePass = new OutlinePass(scene, camera);
        const bokehPass = new BokehPass(scene, camera, {
            focus: 1.0,
            aperture: 0.025,
            maxblur: 0.01
        });

        for (const pass of [renderPass, outlinePass, bokehPass]) {
            composer.addPass(pass)
        }

        this.composer = composer;
        this.outline = outlinePass;
        this.bokeh = bokehPass;
    }
}

export { PostProcessor }