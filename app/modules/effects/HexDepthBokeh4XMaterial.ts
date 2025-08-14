import { NoBlending, ShaderMaterial, Uniform, Matrix4, Texture, Vector2 } from "three";

import fragmentShader from "./shaders/hexDepthBokeh4X.frag";
import vertexShader from "./shaders/hexBokehFocalParams.vert";

/**
 * A Circle of Confusion shader material.
 */

export class HexDepthBokeh4XMaterial extends ShaderMaterial {

	/**
	 * Constructs a new CoC material.
	 *
	 * @param {Camera} camera - A camera.
	 */

	constructor(depthTexture: Texture, autoFocusBuffer: Texture) {

		super({
			name: "HexDepthBokeh4XMaterial",
			defines: {
				DEPTH_PACKING: "0"
			},
			uniforms: {
				depthBuffer: new Uniform(depthTexture),
				focusDistance: new Uniform(0.0),
				mFocalRegion: new Uniform(1.0),
				mFstop: new Uniform(1.8),
				mFocalLength: new Uniform(35),
				autoFocusBuffer: new Uniform(autoFocusBuffer),
				texelSize: new Uniform(new Vector2())
			},
			blending: NoBlending,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

	}

	setSize(width: number, height: number) {

		this.uniforms.texelSize.value.set(1.0 / width, 1.0 / height);

	}

}
