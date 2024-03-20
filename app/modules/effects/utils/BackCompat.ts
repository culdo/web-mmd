import { ToneMappingMode } from "postprocessing";
import { ColorSpace, REVISION, Texture } from "three";

const revision = Number(REVISION.replace(/\D+/g, ""));

/**
 * Returns the output color space of the given renderer.
 *
 * @param {WebGLRenderer} renderer - A renderer.
 * @return {ColorSpace} The output color space, or null if the renderer is null.
 * @ignore
 */

export function getOutputColorSpace(renderer: { outputColorSpace: any; outputEncoding: number; } | null) {

	return renderer === null ? null : renderer.outputColorSpace

}

/**
 * Sets the color space of a given texture.
 *
 * @param {Texture} texture - A texture.
 * @param {ColorSpace} colorSpace - The color space.
 * @ignore
 */

export function setTextureColorSpace(texture: Texture | null, colorSpace: ColorSpace) {

	if (texture === null) {

		return;

	}
	texture.colorSpace = colorSpace;

}

/**
 * Copies the color space of a source texture to a destination texture.
 *
 * @param {Texture} src - The source texture.
 * @param {Texture} dest - The destination texture.
 * @ignore
 */

export function copyTextureColorSpace(src: { colorSpace: any; encoding: any; } | null, dest: { colorSpace: any; encoding: any; } | null) {

	if (src === null || dest === null) {

		return;

	}

	dest.colorSpace = src.colorSpace;

}

/**
 * Updates the given fragment shader for the current version of three.
 *
 * @param {String} fragmentShader - A fragment shader.
 * @return {String} The modified fragment shader.
 * @ignore
 */

export function updateFragmentShader(fragmentShader: string) {

	if (revision < 154) {

		return fragmentShader.replace("colorspace_fragment", "encodings_fragment");

	}

	return fragmentShader;

}

/**
 * Updates the given vertex shader for the current version of three.
 *
 * @param {String} vertexShader - A vertex shader.
 * @return {String} The modified vertex shader.
 * @ignore
 */

export function updateVertexShader(vertexShader: any) {

	return vertexShader;

}

/**
 * Validates the given tone mapping mode against the current version of three.
 *
 * @param {ToneMappingMode} mode - A tone mapping mode.
 * @return {ToneMappingMode} The validated tone mapping mode.
 * @ignore
 */

export function validateToneMappingMode(mode: ToneMappingMode) {

	if (revision < 160 && mode === ToneMappingMode.AGX) {

		console.warn("AgX requires three r160 or higher, falling back to ACES filmic");
		mode = ToneMappingMode.ACES_FILMIC;

	}

	return mode;

}
