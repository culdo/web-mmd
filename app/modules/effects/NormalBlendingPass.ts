import { Pass } from "postprocessing";
import { NormalBlendingMaterial } from "./NormalBlendingMaterial";
import { Texture, WebGLRenderer, WebGLRenderTarget } from "three";

type RuntimeTexture = Texture & {
	width?: number, height?: number
}

export class NormalBlendingPass extends Pass {
	outputBuffer: WebGLRenderTarget;

	constructor(baseMap: RuntimeTexture, detailMap: Texture) {

		super("NormalBlendingPass");

		this.fullscreenMaterial = new NormalBlendingMaterial(baseMap, detailMap);
		this.outputBuffer = new WebGLRenderTarget(baseMap.width, baseMap.height, { depthBuffer: false })
		this.outputBuffer.texture.name = "RNM-Map"
		this.outputBuffer.texture.wrapS = 1000
		this.outputBuffer.texture.wrapT = 1000
		this.needsSwap = false

	}

	render(renderer: WebGLRenderer, inputBuffer: WebGLRenderTarget, outputBuffer: WebGLRenderTarget) {

		renderer.setRenderTarget(this.outputBuffer);
		renderer.render(this.scene, this.camera);

	}

}