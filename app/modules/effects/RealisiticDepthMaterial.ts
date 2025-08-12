import { Color, NoBlending, PerspectiveCamera, ShaderMaterial, Uniform } from "three";

import fragmentShader from "./shaders/realisitic-depth.frag";
import vertexShader from "./shaders/realisitic-depth.vert";

/**
 * A depth comparison shader material.
 */

export class RealisiticDepthMaterial extends ShaderMaterial {
	color: Color;

	/**
	 * Constructs a new depth comparison material.
	 *
	 * @param {PerspectiveCamera} [camera] - A camera.
	 */

	constructor(camera: PerspectiveCamera) {

		super({
			name: "RealisiticDepthMaterial",
			uniforms: {
				cameraNear: new Uniform(0.3),
				cameraFar: new Uniform(1000)
			},
			blending: NoBlending,
			toneMapped: false,
			depthWrite: true,
			depthTest: true,
			fragmentShader,
			vertexShader
		});


		this.color = new Color()
		this.copyCameraSettings(camera);

	}

	/**
	 * Copies the settings of the given camera.
	 *
	 * @deprecated Use copyCameraSettings instead.
	 * @param {Camera} camera - A camera.
	 */

	adoptCameraSettings(camera: PerspectiveCamera) {

		this.copyCameraSettings(camera);

	}

	/**
	 * Copies the settings of the given camera.
	 *
	 * @param {Camera} camera - A camera.
	 */

	copyCameraSettings(camera: PerspectiveCamera) {

		if(camera) {
			this.uniforms.cameraNear.value = camera.near;
			this.uniforms.cameraFar.value = camera.far;
			this.needsUpdate = true;
		}

	}

}
