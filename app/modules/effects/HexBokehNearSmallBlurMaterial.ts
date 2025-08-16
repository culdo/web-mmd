import { NoBlending, ShaderMaterial, Uniform, Vector2 } from "three";

import fragmentShader from "./shaders/hexBokehNearSmallBlur.frag";
import vertexShader from "./shaders/common.vert";

export class HexBokehNearSmallBlurMaterial extends ShaderMaterial {

	constructor() {

		super({
			name: "HexBokehNearSmallBlurMaterial",
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
