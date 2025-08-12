import { NoBlending, ShaderMaterial, Uniform, Vector2 } from "three";

import fragmentShader from "./shaders/hexBokehNearSmallBlur.frag";
import vertexShader from "./shaders/common.vert";

export class HexBokehNearSmallBlurMaterial extends ShaderMaterial {

	constructor() {

		super({
			name: "HexBokehNearSmallBlurMaterial",
			defines: {
				DEPTH_PACKING: "0"
			},
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

	setSize(width: number, height: number) {
		this.uniforms.offset.value.set(1.0 / width, 1.0 / height);
	}
}
