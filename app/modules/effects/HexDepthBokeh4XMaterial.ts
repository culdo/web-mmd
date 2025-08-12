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
				focusRange: new Uniform(0.0),
				cameraNear: new Uniform(0.3),
				cameraFar: new Uniform(1000),
				autoFocusBuffer: new Uniform(autoFocusBuffer),
				projectionMatrix: new Uniform(new Matrix4()),
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
