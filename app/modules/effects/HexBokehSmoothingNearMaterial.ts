import { NoBlending, ShaderMaterial, Uniform, Vector2 } from "three";

import fragmentShader from "./shaders/hexBokehSmoothingNear.frag";
import vertexShader from "./shaders/common.vert";

/**
 * A Circle of Confusion shader material.
 */

export class HexBokehSmoothingNearMaterial extends ShaderMaterial {

	/**
	 * Constructs a new CoC material.
	 *
	 * @param {Camera} camera - A camera.
	 */

	constructor() {

		super({
			name: "HexBokehSmoothingNearMaterial",
			uniforms: {
				inputBuffer: new Uniform(null),
				offset: new Uniform(new Vector2())
			},
			blending: NoBlending,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

	}

	set offset(value: Vector2) {
		this.uniforms.offset.value = value
	}

}
