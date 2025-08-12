import { NoBlending, ShaderMaterial, Texture, Uniform } from "three";

import fragmentShader from "./shaders/hexBokehFarGather.frag";
import vertexShader from "./shaders/common.vert";

export class HexBokehFarGatherMaterial extends ShaderMaterial {

	constructor(bokehBuffer: Texture) {

		super({
			name: "HexBokehFarGatherMaterial",
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
