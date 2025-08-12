import { NoBlending, RawShaderMaterial, Uniform, Vector2, GLSL3, Texture } from "three";

import fragmentShader from "./shaders/hexBlurFarX.frag";
import vertexShader from "./shaders/hexBokeh.vert";

/**
 * A hex bokeh blur material.
 *
 * Enabling the `foreground` option causes the shader to combine the near and far CoC values around foreground objects.
 *
 * @implements {Resizable}
 */

export class HexBlurFarXMaterial extends RawShaderMaterial {

	/**
	 * Constructs a new bokeh material.
	 *
	 * @param {Boolean} [foreground=false] - Determines whether this material will be applied to foreground colors.
	 */

	constructor(cocBuffer: Texture) {

		super({
			name: "HexBlurFarXMaterial",
			uniforms: {
				inputBuffer: new Uniform(null),
				cocBuffer: new Uniform(cocBuffer),
				texelSize: new Uniform(new Vector2()),
			},
			blending: NoBlending,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader,
			glslVersion: GLSL3
		});

	}

	/**
	 * Sets the texel size.
	 *
	 * @deprecated Use setSize() instead.
	 * @param {Number} x - The texel width.
	 * @param {Number} y - The texel height.
	 */

	setTexelSize(x: number, y: number) {

		this.uniforms.texelSize.value.set(x, y);

	}

	/**
	 * Sets the size of this object.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width: number, height: number) {

		this.uniforms.texelSize.value.set(1.0 / width, 1.0 / height);

	}

}