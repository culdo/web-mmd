import {
	BlendFunction,
	Effect,
	RenderPass,
	Resolution,
	ShaderPass,
	OverrideMaterialManager
} from "postprocessing";
import { Camera, Color, PerspectiveCamera, Scene, SRGBColorSpace, Texture, TextureDataType, Uniform, UnsignedByteType, Vector2, Vector3, WebGLRenderer, WebGLRenderTarget } from "three";

import { HexDepthBokeh4XMaterial } from "./HexDepthBokeh4XMaterial";
import { WorldScaledDepthMaterial } from "./WorldScaledDepthMaterial";
import { HexBlurFarXMaterial } from "./HexBlurFarXMaterial";
import { HexBlurFarYMaterial } from "./HexBlurFarYMaterial";
import { HexBokehFarGatherMaterial } from "./HexBokehFarGatherMaterial";
import { HexBokehNearCoCMaterial } from "./HexBokehNearCoCMaterial";
import { HexBokehNearDownMaterial } from "./HexBokehNearDownMaterial";
import { HexBokehNearSmallBlurMaterial } from "./HexBokehNearSmallBlurMaterial";
import { HexBokehSmoothingNearMaterial } from "./HexBokehSmoothingNearMaterial";
import { HexBokehFocalDistanceMaterial } from "./HexBokehFocalDistanceMaterial";

import fragmentShader from "./shaders/hexDof.frag";
import vertexShader from "./shaders/hexDof.vert";
import { getOutputColorSpace, setTextureColorSpace } from "./utils/all";

OverrideMaterialManager.workaroundEnabled = true;

type DepthBokeh4XPass = ShaderPass & {fullscreenMaterial: HexDepthBokeh4XMaterial}
type HexBlurFarX = ShaderPass & {fullscreenMaterial: HexBlurFarXMaterial}
type HexBlurFarY = ShaderPass & {fullscreenMaterial: HexBlurFarYMaterial}
type HexBokehFarGatherPass = ShaderPass & {fullscreenMaterial: HexBokehFarGatherMaterial}

type HexBokehNearCoCPass = ShaderPass & {fullscreenMaterial: HexBokehNearCoCMaterial}
type HexBokehNearDownPass = ShaderPass & {fullscreenMaterial: HexBokehNearDownMaterial}
type HexBokehSmoothingNearPass = ShaderPass & {fullscreenMaterial: HexBokehSmoothingNearMaterial}

type HexBokehNearSmallBlurPass = ShaderPass & {fullscreenMaterial: HexBokehNearSmallBlurMaterial}
type HexBokehFocalDistancePass = ShaderPass & {fullscreenMaterial: HexBokehFocalDistanceMaterial}

export class HexDofEffect extends Effect {
	camera: PerspectiveCamera;
	renderTarget: WebGLRenderTarget;
	renderTargetBokehTemp: WebGLRenderTarget;
	renderTargetDepth: WebGLRenderTarget;
	renderTargetFar: WebGLRenderTarget;
	renderTargetCoC: WebGLRenderTarget;
	depthPass: RenderPass
	depthBokeh4XPass: DepthBokeh4XPass;
	hexBlurFarXPass: HexBlurFarX;
	hexBlurFarYPass: HexBlurFarY;
	hexBokehFarGatherPass: HexBokehFarGatherPass;
	hexBokehNearCoCPass: HexBokehNearCoCPass;
	hexBokehNearDownPass: HexBokehNearDownPass;
	hexBokehNearSmallBlurPass: HexBokehNearSmallBlurPass;
	hexBokehSmoothingNearXPass: HexBokehSmoothingNearPass;
	hexBokehSmoothingNearYPass: HexBokehSmoothingNearPass;
	target: Vector3;
	resolution: Resolution;
	scene: Scene;
	renderTargetFocalBlurred: WebGLRenderTarget<Texture>;
	renderTargetFocusDistance: WebGLRenderTarget<Texture>;
	renderTargetCoCNear: WebGLRenderTarget<Texture>;
	hexBokehFocalDistancePass: HexBokehFocalDistancePass;
	pixels: Float32Array<ArrayBuffer>;

	/**
	 * Constructs a new depth of field effect.
	 *
	 * @param {Camera} camera - The main camera.
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction] - The blend function of this effect.
	 * @param {Number} [options.worldFocusDistance] - The focus distance in world units.
	 * @param {Number} [options.worldFocusRange] - The focus distance in world units.
	 * @param {Number} [options.focusDistance=0.0] - The normalized focus distance. Range is [0.0, 1.0].
	 * @param {Number} [options.focusRange=0.1] - The focus range. Range is [0.0, 1.0].
	 * @param {Number} [options.focalLength=0.1] - Deprecated.
	 * @param {Number} [options.bokehScale=1.0] - The scale of the bokeh blur.
	 * @param {Number} [options.resolutionScale=0.5] - The resolution scale.
	 * @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
	 * @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
	 * @param {Number} [options.width=Resolution.AUTO_SIZE] - Deprecated. Use resolutionX instead.
	 * @param {Number} [options.height=Resolution.AUTO_SIZE] - Deprecated. Use resolutionY instead.
	 */

	constructor(scene: Scene, camera: PerspectiveCamera, {
		blendFunction,
		worldFocusDistance,
		worldFocusRange,
		focusDistance = 0.0,
		focalLength = 0.1,
		focusRange = focalLength,
		bokehScale = 1.0,
		resolutionScale = 1.0,
		width = Resolution.AUTO_SIZE,
		height = Resolution.AUTO_SIZE,
		resolutionX = width,
		resolutionY = height
	}: { blendFunction?: BlendFunction; worldFocusDistance?: number; worldFocusRange?: number; focusDistance?: number; focusRange?: number; focalLength?: number; bokehScale?: number; resolutionScale?: number; resolutionX?: number; resolutionY?: number; width?: number; height?: number; } = {}) {

		super("HexDofEffect", fragmentShader, {
			vertexShader,
			blendFunction,
			uniforms: new Map([
				// mMeasureMode: 当数值在0.0是使用自动测距，数值在0.25时可以跟随骨骼并且自动测距，数值0.5时使用固定的焦长，数值1.0时使用相机到骨骼的距离
				["mMeasureMode", new Uniform(0.0)],
				["mTestMode", new Uniform(0.0)],
				["mFocalDistance", new Uniform(1.0)],
				["wDepthBuffer", new Uniform(null)],
				["bokehBuffer", new Uniform(null)],
				["nearBuffer", new Uniform(null)],
				["autoFocusBuffer", new Uniform(null)],
				["mFstop", new Uniform(1.8)],
				["mFocalLength", new Uniform(camera.getFocalLength())],
				["viewportSize", new Uniform(new Vector2())],
				["offset", new Uniform(new Vector2())],
				["mFocalRegion", new Uniform(1.0)]
			])
		});

		/**
		 * The main camera.
		 *
		 * @type {Camera}
		 * @private
		 */

		this.camera = camera;
		this.scene = scene;

		/**
		 * A render target for intermediate results.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTarget = new WebGLRenderTarget(1, 1, { depthBuffer: false });
		this.renderTarget.texture.name = "DoF.Intermediate";

		this.renderTargetDepth = new WebGLRenderTarget(1, 1);
		this.renderTargetDepth.texture.name = "DoF.Depth";
		this.uniforms.get("wDepthBuffer").value = this.renderTargetDepth.texture;

		this.renderTargetFocusDistance = this.renderTarget.clone();
		this.renderTargetFocusDistance.texture.name = "DoF.FocalDistance";
		this.uniforms.get("autoFocusBuffer").value = this.renderTargetFocusDistance.texture;

		/**
		 * A render target for masked background colors (premultiplied with CoC).
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetBokehTemp = this.renderTarget.clone();
		this.renderTargetBokehTemp.texture.name = "DoF.Bokeh.Temp";
		this.uniforms.get("bokehBuffer").value = this.renderTargetBokehTemp.texture;

		this.renderTargetFocalBlurred = new WebGLRenderTarget(1, 1, { depthBuffer: false, count: 2 });

		this.renderTargetFocalBlurred.textures[0].name = "DoF.vertical"
		this.renderTargetFocalBlurred.textures[1].name = "DoF.diagonal"


		/**
		 * A render target for the blurred foreground colors.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */
		this.renderTargetCoCNear = this.renderTarget.clone();
		this.renderTargetCoCNear.texture.name = "DoF.CoC.Near";
		this.uniforms.get("nearBuffer").value = this.renderTargetCoCNear.texture;
		

		/**
		 * A render target for the blurred background colors.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetFar = this.renderTarget.clone();
		this.renderTargetFar.texture.name = "DoF.Bokeh.Far";

		/**
		 * A render target for the circle of confusion.
		 *
		 * - Negative values are stored in the `RED` channel (foreground).
		 * - Positive values are stored in the `GREEN` channel (background).
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */
		this.renderTargetCoC = this.renderTarget.clone();
		this.renderTargetCoC.texture.name = "DoF.CoC";


		// Depth pass
		this.depthPass = new RenderPass(scene, camera, new WorldScaledDepthMaterial());

		const clearPass = this.depthPass.clearPass;
		clearPass.overrideClearColor = new Color(0xffffff);
		clearPass.overrideClearAlpha = 1;

		this.hexBokehFocalDistancePass = new ShaderPass(new HexBokehFocalDistanceMaterial(
			this.renderTargetDepth.texture
		)) as HexBokehFocalDistancePass;
		
		/**
		 * A circle of confusion pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.depthBokeh4XPass = new ShaderPass(
			new HexDepthBokeh4XMaterial(
				camera,
				this.renderTargetDepth.texture, 
				this.renderTargetFocusDistance.texture
			)
		) as DepthBokeh4XPass;


		/**
		 * This pass blurs the foreground CoC buffer to soften edges.
		 *
		 * @type {KawaseBlurPass}
		 * @readonly
		 */

		this.hexBokehFarGatherPass = new ShaderPass(new HexBokehFarGatherMaterial(
			this.renderTargetCoC.texture
		)) as HexBokehFarGatherPass;
		
		this.hexBokehNearDownPass = new ShaderPass(new HexBokehNearDownMaterial()) as HexBokehNearDownPass;
		
		this.hexBokehSmoothingNearXPass = new ShaderPass(new HexBokehSmoothingNearMaterial()) as HexBokehSmoothingNearPass;
		this.hexBokehSmoothingNearYPass = new ShaderPass(new HexBokehSmoothingNearMaterial()) as HexBokehSmoothingNearPass;
		
		this.hexBokehNearCoCPass = new ShaderPass(new HexBokehNearCoCMaterial(
			this.renderTargetCoCNear.texture
		)) as HexBokehNearCoCPass;

		this.hexBokehNearSmallBlurPass = new ShaderPass(new HexBokehNearSmallBlurMaterial()) as HexBokehNearSmallBlurPass;
	

		/**
		 * A bokeh blur pass for the background colors.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.hexBlurFarXPass = new ShaderPass(new HexBlurFarXMaterial(this.renderTargetCoC.texture)) as HexBlurFarX;

		/**
		 * A bokeh fill pass for the background colors.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.hexBlurFarYPass = new ShaderPass(new HexBlurFarYMaterial(
			this.renderTargetCoC.texture,
			this.renderTargetFocalBlurred.textures[0],
			this.renderTargetFocalBlurred.textures[1]
		)) as HexBlurFarY;

		/**
		 * A target position that should be kept in focus. Set to `null` to disable auto focus.
		 *
		 * @type {Vector3}
		 */

		this.target = null;

		/**
		 * The render resolution.
		 *
		 * @type {Resolution}
		 * @readonly
		 */

		this.resolution = new Resolution(this, resolutionX, resolutionY, resolutionScale);

		this.pixels = new Float32Array(this.resolution.baseWidth * this.resolution.baseHeight * 4);
	}

	/**
	 * Returns the pass that blurs the foreground CoC buffer to soften edges.
	 *
	 * @deprecated Use blurPass instead.
	 * @return {KawaseBlurPass} The blur pass.
	 */

	getBlurPass() {

		return this.hexBokehFarGatherPass;

	}

	/**
	 * Returns the resolution settings.
	 *
	 * @deprecated Use resolution instead.
	 * @return {Resolution} The resolution.
	 */

	getResolution() {

		return this.resolution;

	}

	/**
	 * Returns the current auto focus target.
	 *
	 * @deprecated Use target instead.
	 * @return {Vector3} The target.
	 */

	getTarget() {

		return this.target;

	}

	/**
	 * Sets the auto focus target.
	 *
	 * @deprecated Use target instead.
	 * @param {Vector3} value - The target.
	 */

	setTarget(value: null) {

		this.target = value;

	}

	/**
	 * Calculates the focus distance from the camera to the given position.
	 *
	 * @param {Vector3} target - The target.
	 * @return {Number} The normalized focus distance.
	 */

	calculateFocusDistance(target: Vector3) {

		const camera = this.camera;
		const distance = camera.position.distanceTo(target);
		return distance / camera.far;

	}

	debugRenderTarget(renderer: WebGLRenderer, renderTarget: WebGLRenderTarget, redChannel=false) {
		renderer.readRenderTargetPixels(
			renderTarget, 0, 0, this.resolution.baseWidth, this.resolution.baseHeight, this.pixels
		);
		const debugResult = redChannel ? this.pixels.filter((_, i) => i % 4 == 0) : this.pixels
		return debugResult
	}

	/**
	 * Updates this effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 */

	update(renderer: WebGLRenderer, inputBuffer: WebGLRenderTarget<Texture>, deltaTime: any) {

		const renderTargetCoC = this.renderTargetCoC;
		const renderTargetHexBlurred = this.renderTargetFocalBlurred;
		const renderTargetBokehTemp = this.renderTargetBokehTemp;

		// Render Depth
		this.depthPass.render(renderer, this.renderTargetDepth, null);

		// Render Auto focaus distance
		this.hexBokehFocalDistancePass.render(renderer, null, this.renderTargetFocusDistance)

		this.depthBokeh4XPass.render(renderer, inputBuffer, renderTargetCoC);
		
		// const debugResult = this.debugRenderTarget(renderer, this.renderTargetFocusDistance)
		
		// Far
		this.hexBlurFarXPass.render(renderer, renderTargetCoC, renderTargetHexBlurred);
		this.hexBlurFarYPass.render(renderer, null, this.renderTargetFar);
		
		this.hexBokehFarGatherPass.render(renderer, this.renderTargetFar, renderTargetBokehTemp);

		// Near
		this.hexBokehNearDownPass.render(renderer, renderTargetBokehTemp, this.renderTargetCoCNear);

		this.hexBokehSmoothingNearXPass.render(renderer, this.renderTargetCoCNear, renderTargetBokehTemp);
		this.hexBokehSmoothingNearYPass.render(renderer, renderTargetBokehTemp, this.renderTargetCoCNear);

		this.hexBokehNearCoCPass.render(renderer, renderTargetCoC, renderTargetBokehTemp);
		this.hexBokehNearSmallBlurPass.render(renderer, renderTargetBokehTemp, this.renderTargetCoCNear);

	}

	/**
	 * Updates the size of internal render targets.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width: number, height: number) {

		const resolution = this.resolution;
		resolution.setBaseSize(width, height);
		const w = resolution.width, h = resolution.height;

		// These buffers require full resolution to prevent color bleeding.
		this.renderTargetFar.setSize(width, height);
		this.renderTargetCoC.setSize(width, height);
		this.renderTargetCoCNear.setSize(width, height);
		this.renderTargetBokehTemp.setSize(width, height);
		this.renderTargetFocusDistance.setSize(width, height);
		
		this.renderTargetDepth.setSize(w, h);
		this.renderTarget.setSize(w, h);
		this.renderTargetFocalBlurred.setSize(w, h);
		
		const offsetX = 1 / (1024 * width / height)
		const offsetY = 1 / 1024

		// Optimization: 1 / (TexelSize * ResolutionScale) = FullResolution
		this.depthBokeh4XPass.fullscreenMaterial.setSize(width, height);
		this.hexBokehNearDownPass.fullscreenMaterial.offset = new Vector2(offsetX, offsetY);

		this.hexBokehSmoothingNearXPass.fullscreenMaterial.offset = new Vector2(offsetX, 0.0);
		this.hexBokehSmoothingNearYPass.fullscreenMaterial.offset = new Vector2(0.0, offsetY);
		
		this.hexBokehNearSmallBlurPass.fullscreenMaterial.offset = new Vector2(0.0, offsetY);

		this.hexBlurFarXPass.fullscreenMaterial.setSize(width, height);
		this.hexBlurFarYPass.fullscreenMaterial.setSize(width, height);

		this.pixels = new Float32Array(this.resolution.baseWidth * this.resolution.baseHeight * 4);

		this.uniforms.get("viewportSize").value.set(width, height)
		this.uniforms.get("offset").value.set(offsetX, offsetY)
	}

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 * @param {Number} frameBufferType - The type of the main frame buffers.
	 */

	initialize(renderer: WebGLRenderer, alpha: boolean, frameBufferType: TextureDataType) {

		this.depthPass.initialize(renderer, alpha, frameBufferType);
		this.hexBokehFocalDistancePass.initialize(renderer, alpha, frameBufferType);
		this.depthBokeh4XPass.initialize(renderer, alpha, frameBufferType);
		this.hexBlurFarXPass.initialize(renderer, alpha, frameBufferType);
		this.hexBlurFarYPass.initialize(renderer, alpha, frameBufferType);
		this.hexBokehNearCoCPass.initialize(renderer, alpha, frameBufferType);
		this.hexBokehNearDownPass.initialize(renderer, alpha, frameBufferType);
		this.hexBokehNearSmallBlurPass.initialize(renderer, alpha, frameBufferType);
		this.hexBokehSmoothingNearXPass.initialize(renderer, alpha, frameBufferType);
		this.hexBokehSmoothingNearYPass.initialize(renderer, alpha, frameBufferType);

		// The blur pass operates on the CoC buffer.
		this.hexBokehFarGatherPass.initialize(renderer, alpha, UnsignedByteType);

		if(renderer.capabilities.logarithmicDepthBuffer) {

			this.depthBokeh4XPass.fullscreenMaterial.defines.LOG_DEPTH = "1";

		}

		if(frameBufferType !== undefined) {

			this.renderTargetFocusDistance.texture.type = frameBufferType;
			this.renderTargetCoC.texture.type = frameBufferType;
			this.renderTargetCoCNear.texture.type = frameBufferType;
			this.renderTarget.texture.type = frameBufferType;
			this.renderTargetFocalBlurred.texture.type = frameBufferType;
			this.renderTargetDepth.texture.type = frameBufferType;
			this.renderTargetFar.texture.type = frameBufferType;
			this.renderTargetBokehTemp.texture.type = frameBufferType;

			if(getOutputColorSpace(renderer) === SRGBColorSpace) {

				setTextureColorSpace(this.renderTarget.texture, SRGBColorSpace);
				setTextureColorSpace(this.renderTargetFocalBlurred.texture, SRGBColorSpace);
				setTextureColorSpace(this.renderTargetFar.texture, SRGBColorSpace);
				setTextureColorSpace(this.renderTargetBokehTemp.texture, SRGBColorSpace);

			}

		}

	}

}
