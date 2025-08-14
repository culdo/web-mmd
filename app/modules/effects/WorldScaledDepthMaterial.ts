import { NoBlending, ShaderMaterial } from "three";

import fragmentShader from "./shaders/worldScaledDepth.frag";
import vertexShader from "./shaders/worldScaledDepth.vert";

export class WorldScaledDepthMaterial extends ShaderMaterial {

	constructor() {

		super({
			name: "WorldScaledDepthMaterial",
			blending: NoBlending,
			toneMapped: false,
			depthWrite: true,
			depthTest: true,
			fragmentShader,
			vertexShader
		});
	}

}
