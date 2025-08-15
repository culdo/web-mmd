import { NoBlending, ShaderMaterial, Uniform, Texture, Vector2, PerspectiveCamera } from "three";

import fragmentShader from "./shaders/hexDepthBokeh4X.frag";
import vertexShader from "./shaders/hexBokehFocalParams.vert";

export class HexDepthBokeh4XMaterial extends ShaderMaterial {

	constructor(camera: PerspectiveCamera, depthTexture: Texture, autoFocusBuffer: Texture) {

		super({
			name: "HexDepthBokeh4XMaterial",
			uniforms: {
				depthBuffer: new Uniform(depthTexture),
				mFocalRegion: new Uniform(1.0),
				mFstop: new Uniform(1.8),
				mFocalLength: new Uniform(camera.getFocalLength()),
				autoFocusBuffer: new Uniform(autoFocusBuffer),
				texelSize: new Uniform(new Vector2())
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

		this.uniforms.texelSize.value.set(1.0 / width, 1.0 / height);

	}

}
