import { NoBlending, ShaderMaterial, Uniform, Texture, Vector2 } from "three";

import fragmentShader from "./shaders/normalBlendingEffect.frag";
import vertexShader from "./shaders/common.vert";

export class NormalBlendingMaterial extends ShaderMaterial {

	constructor(baseMap: Texture, detailMap: Texture) {

		super({
			name: "NormalBlendingMaterial",
			uniforms: {
				baseMap: new Uniform(baseMap),
				detailMap: new Uniform(detailMap),
			},
			blending: NoBlending,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

	}

}
