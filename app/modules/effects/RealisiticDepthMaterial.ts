import { Color, NoBlending, ShaderMaterial } from "three";

import fragmentShader from "./shaders/realisitic-depth.frag";
import vertexShader from "./shaders/realisitic-depth.vert";

/**
 * A depth comparison shader material.
 */

export class RealisiticDepthMaterial extends ShaderMaterial {
	color: Color;

	constructor() {
		super({
			name: "RealisiticDepthMaterial",
			blending: NoBlending,
			toneMapped: false,
			depthWrite: true,
			depthTest: true,
			fragmentShader,
			vertexShader
		});

		this.color = new Color()
	}
}
