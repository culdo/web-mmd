import { NoBlending, ShaderMaterial, Texture, Uniform, Vector2 } from "three";

import fragmentShader from "./shaders/hexBokehFocalDistance.frag";
import vertexShader from "./shaders/common.vert";

export class HexBokehFocalDistanceMaterial extends ShaderMaterial {

	constructor(depthBuffer: Texture) {

		super({
			name: "HexBokehFocalDistanceMaterial",
			defines: {
				DEPTH_PACKING: "0"
			},
			uniforms: {
				inputBuffer: new Uniform(null),
				depthBuffer: new Uniform(null),
				viewportAspect: new Uniform(new Vector2()),
				bonePos: new Uniform(new Vector2()),
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
