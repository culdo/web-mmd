import { NoBlending, ShaderMaterial, Texture, Uniform, Vector2 } from "three";

import fragmentShader from "./shaders/hexBokehFocalDistance.frag";
import vertexShader from "./shaders/common.vert";

export class HexBokehFocalDistanceMaterial extends ShaderMaterial {

	constructor(depthBuffer: Texture) {

		super({
			name: "HexBokehFocalDistanceMaterial",
			defines: {
				DOF_POSSION_SAMPLES: "36"
			},
			uniforms: {
				inputBuffer: new Uniform(null),
				depthBuffer: new Uniform(depthBuffer),
				viewportAspect: new Uniform(16/9),
				bonePos: new Uniform(new Vector2()),
				// mMeasureMode: 当数值在0.0是使用自动测距，数值在0.25时可以跟随骨骼并且自动测距，数值0.5时使用固定的焦长，数值1.0时使用相机到骨骼的距离
				mMeasureMode: new Uniform(0.0),
				mFocalDistance: new Uniform(1.0),
				mFocalLength: new Uniform(35.0),
				vFov: new Uniform(0.0),
				mFstop: new Uniform(1.8),
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
		this.uniforms.viewportAspect.value = width / height;
	}

	set vFov(value: number) {
		this.uniforms.vFov.value = value
	}

}
