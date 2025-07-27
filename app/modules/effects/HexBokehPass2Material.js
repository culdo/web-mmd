import { NoBlending, RawShaderMaterial, Uniform, Vector2, GLSL3 } from "three";

import fragmentShader from "./shaders/hexBokehPass2.frag";
import vertexShader from "./shaders/hexBokeh.vert";

/**
 * A hex bokeh blur material.
 *
 * Enabling the `foreground` option causes the shader to combine the near and far CoC values around foreground objects.
 *
 * @implements {Resizable}
 */

export class HexBokehPass2Material extends RawShaderMaterial {

	/**
	 * Constructs a new bokeh material.
	 *
	 * @param {Boolean} [foreground=false] - Determines whether this material will be applied to foreground colors.
	 */

	constructor(foreground = false) {

		super({
			name: "HexBokehPass2Material",
			defines: {
				FOREGROUND: foreground ? "1" : "0"
			},
			uniforms: {
				vertical: new Uniform(null),
				diagonal: new Uniform(null),
				cocBuffer: new Uniform(null),
				texelSize: new Uniform(new Vector2()),
				scale: new Uniform(1.0)
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
	 * The vertical buffer.
	 *
	 * @type {Texture}
	 */

	set vertical(value) {

		this.uniforms.vertical.value = value;

	}

	/**
	 * The diagonal buffer.
	 *
	 * @type {Texture}
	 */

	set diagonal(value) {

		this.uniforms.diagonal.value = value;

	}

	/**
	 * The circle of confusion buffer.
	 *
	 * @type {Texture}
	 */

	set cocBuffer(value) {

		this.uniforms.cocBuffer.value = value;

	}

	/**
	 * Sets the circle of confusion buffer.
	 *
	 * @deprecated Use cocBuffer instead.
	 * @param {Texture} value - The buffer.
	 */

	setCoCBuffer(value) {

		this.uniforms.cocBuffer.value = value;

	}

	/**
	 * The blur scale.
	 *
	 * @type {Number}
	 */

	get scale() {

		return this.uniforms.scale.value;

	}

	set scale(value) {

		this.uniforms.scale.value = value;

	}

	/**
	 * Returns the blur scale.
	 *
	 * @deprecated Use scale instead.
	 * @return {Number} The scale.
	 */

	getScale(value) {

		return this.scale;

	}

	/**
	 * Sets the blur scale.
	 *
	 * @deprecated Use scale instead.
	 * @param {Number} value - The scale.
	 */

	setScale(value) {

		this.scale = value;

	}

	/**
	 * Sets the texel size.
	 *
	 * @deprecated Use setSize() instead.
	 * @param {Number} x - The texel width.
	 * @param {Number} y - The texel height.
	 */

	setTexelSize(x, y) {

		this.uniforms.texelSize.value.set(x, y);

	}

	/**
	 * Sets the size of this object.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.uniforms.texelSize.value.set(1.0 / width, 1.0 / height);

	}

}