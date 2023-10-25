import {
	ShaderMaterial,
	UniformsUtils,
	WebGLRenderTarget,
	HalfFloatType
} from 'three';

import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass';
import { BokehShader, BokehDepthShader } from 'three/examples/jsm/shaders/BokehShader2';

/**
 * Depth-of-field post-process with bokeh shader
 */

class BokehPass extends Pass {

	constructor(scene, camera, params) {

		super();

		this.scene = scene;
		this.camera = camera;

		// effect controller default values
		this.effectController = {
			enabled: true,
			shaderFocus: false,

			fstop: 2.2,
			maxblur: 1.0,

			showFocus: false,
			focalDepth: 2.8,
			manualdof: false,
			vignetting: false,
			depthblur: false,

			threshold: 0.5,
			gain: 2.0,
			bias: 0.5,
			fringe: 0.7,

			focalLength: 35,
			noise: true,
			pentagon: false,

			dithering: 0.0001,
			// shader settings
			rings: 3,
			samples: 4
		};

		// render targets
		this.renderTargetDepth = new WebGLRenderTarget(
			window.innerWidth,
			window.innerHeight,
			{ type: HalfFloatType }
		);

		// depth material

		const depthShader = BokehDepthShader;

		this.materialDepth = new ShaderMaterial({
			uniforms: depthShader.uniforms,
			vertexShader: depthShader.vertexShader,
			fragmentShader: depthShader.fragmentShader
		});

		this.materialDepth.uniforms['mNear'].value = camera.near;
		this.materialDepth.uniforms['mFar'].value = camera.far;

		// bokeh material

		const bokehShader = BokehShader;
		this.uniforms = UniformsUtils.clone(bokehShader.uniforms);

		this.uniforms['tDepth'].value = this.renderTargetDepth.texture;

		this.uniforms['textureWidth'].value = window.innerWidth;
		this.uniforms['textureHeight'].value = window.innerHeight;

		this.materialBokeh = new ShaderMaterial({
			uniforms: this.uniforms,
			vertexShader: bokehShader.vertexShader,
			fragmentShader: bokehShader.fragmentShader,
			defines: {
				RINGS: this.effectController.rings,
				SAMPLES: this.effectController.samples
			}
		});

		this.needsSwap = false;

		this.fsQuad = new FullScreenQuad(this.materialBokeh);

	}

	buildMatChanger(api) {
		return () => {
			for (const e in api) {
				if (e in this.uniforms) {
					this.uniforms[e].value = api[`bokeh ${e}`];
				}
			}

			this.enabled = api["bokeh enabled"];
			this.uniforms['znear'].value = this.camera.near;
			this.uniforms['zfar'].value = this.camera.far;
			this.camera.setFocalLength(api["bokeh focalLength"]);
		}

	};

	buildShaderUpdate(api) {
		return () => {
			this.materialBokeh.defines.RINGS = api["bokeh rings"];
			this.materialBokeh.defines.SAMPLES = api["bokeh samples"];
			this.materialBokeh.needsUpdate = true;
		}
	}

	render(renderer, writeBuffer, readBuffer/*, deltaTime, maskActive*/) {

		// Render depth into texture
		this.scene.overrideMaterial = this.materialDepth;

		renderer.setRenderTarget(this.renderTargetDepth);
		renderer.clear();
		renderer.render(this.scene, this.camera);
		
		this.uniforms['tColor'].value = readBuffer.texture[0];
		
		// Render bokeh composite
		if (this.renderToScreen) {
			renderer.setRenderTarget(null);
			this.fsQuad.render(renderer);
		} else {
			renderer.setRenderTarget(writeBuffer);
			renderer.clear();
			this.fsQuad.render(renderer);
		}
		
		this.scene.overrideMaterial = null;
	}

	setSize(width, height) {

		this.renderTargetDepth.setSize(width, height);

	}

	dispose() {

		this.renderTargetDepth.dispose();

		this.materialDepth.dispose();
		this.materialBokeh.dispose();

		this.fsQuad.dispose();

	}

}

export { BokehPass };
