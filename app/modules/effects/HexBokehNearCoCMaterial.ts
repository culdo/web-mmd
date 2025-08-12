import { NoBlending, ShaderMaterial, Texture, Uniform } from "three";

import fragmentShader from "./shaders/hexBokehNearCoC.frag";
import vertexShader from "./shaders/common.vert";

export class HexBokehNearCoCMaterial extends ShaderMaterial {

	constructor(bokehBuffer: Texture) {

		super({
			name: "HexBokehNearCoCMaterial",
			defines: {
				DEPTH_PACKING: "0"
			},
			uniforms: {
				inputBuffer: new Uniform(null),
				bokehBuffer: new Uniform(bokehBuffer),
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
