import { CopyMaterial, Pass } from 'postprocessing';
import {
	BackSide,
	Camera,
	Color,
	MeshPhongMaterial,
	Scene,
	ShaderMaterial,
	Texture,
	UniformsLib,
	UniformsUtils
} from 'three';
import { initSdef } from '../shaders/SdefVertexShader';
import OutlineShader from './shaders/OutlineShader';

/**
 * Reference: https://en.wikipedia.org/wiki/Cel_shading
 *
 * API
 *
 * 1. Traditional
 *
 * const effect = new OutlineEffect( renderer );
 *
 * function render() {
 *
 * 	effect.render( scene, camera );
 *
 * }
 *
 * 2. VR compatible
 *
 * const effect = new OutlineEffect( renderer );
 * let renderingOutline = false;
 *
 * scene.onAfterRender = function () {
 *
 * 	if ( renderingOutline ) return;
 *
 * 	renderingOutline = true;
 *
 * 	effect.renderOutline( scene, camera );
 *
 * 	renderingOutline = false;
 *
 * };
 *
 * function render() {
 *
 * 	renderer.render( scene, camera );
 *
 * }
 *
 * // How to set default outline parameters
 * new OutlineEffect( renderer, {
 * 	defaultThickness: 0.01,
 * 	defaultColor: [ 0, 0, 0 ],
 * 	defaultAlpha: 0.8,
 * 	defaultKeepAlive: true // keeps outline material in cache even if material is removed from scene
 * } );
 *
 * // How to set outline parameters for each material
 * material.userData.outlineParameters = {
 * 	thickness: 0.01,
 * 	color: [ 0, 0, 0 ],
 * 	alpha: 0.8,
 * 	visible: true,
 * 	keepAlive: true
 * };
 */
type OutlineMaterial = ShaderMaterial & { displacementMap: Texture }

type CachedMaterial = {
	material: OutlineMaterial,
	used: boolean,
	keepAlive: boolean,
	count: number
}
class OutlinePass extends Pass {
	renderScene: Scene;
	renderCamera: Camera;
	copyMaterial: CopyMaterial;
	renderOutline: (renderer: {
		autoClear: boolean; shadowMap: {
			enabled: boolean;
		}; setRenderTarget: (arg0: any) => void; render: (arg0: Scene, arg1: Camera) => void;
	}, inputBuffer: {
		texture: any;
	}, outputBuffer: any) => void;

	constructor(scene: Scene, camera: Camera, parameters: any = {}) {

		super();

		this.enabled = true;

		this.renderScene = scene;
		this.renderCamera = camera;

		const defaultThickness = parameters.defaultThickness !== undefined ? parameters.defaultThickness : 0.003;
		const defaultColor = new Color().fromArray(parameters.defaultColor !== undefined ? parameters.defaultColor : [0, 0, 0]);
		const defaultAlpha = parameters.defaultAlpha !== undefined ? parameters.defaultAlpha : 1.0;
		const defaultKeepAlive = parameters.defaultKeepAlive !== undefined ? parameters.defaultKeepAlive : false;

		// object.material.uuid -> outlineMaterial or
		// object.material[ n ].uuid -> outlineMaterial
		// save at the outline material creation and release
		// if it's unused removeThresholdCount frames
		// unless keepAlive is true.
		const cache: Record<string, CachedMaterial> = {};

		const removeThresholdCount = 60;

		// outlineMaterial.uuid -> object.material or
		// outlineMaterial.uuid -> object.material[ n ]
		// save before render and release after render.
		const originalMaterials: Record<string, MeshPhongMaterial> = {};

		// object.uuid -> originalOnBeforeRender
		// save before render and release after render.
		const originalOnBeforeRenders: Record<string, Function> = {};

		//this.cache = cache;  // for debug

		// keep using readBuffer for following effect passes to read
		this.needsSwap = false;

		this.copyMaterial = new CopyMaterial();

		const uniformsOutline = {
			outlineThickness: { value: defaultThickness },
			outlineColor: { value: defaultColor },
			outlineAlpha: { value: defaultAlpha }
		};


		function createMaterial() {
			const material = new ShaderMaterial({
				uniforms: UniformsUtils.merge([
					UniformsLib['fog'],
					UniformsLib['displacementmap'],
					uniformsOutline
				]),
				vertexShader: parameters.enableSdef ? initSdef(OutlineShader.vertexShader) : OutlineShader.vertexShader,
				fragmentShader: OutlineShader.fragmentShader,
				side: BackSide
			}) as OutlineMaterial
			return material;

		}

		function getOutlineMaterialFromCache(originalMaterial: MeshPhongMaterial) {

			let data = cache[originalMaterial.uuid];

			if (data === undefined) {

				data = {
					material: createMaterial(),
					used: true,
					keepAlive: defaultKeepAlive,
					count: 0
				};

				cache[originalMaterial.uuid] = data;

			}

			data.used = true;

			return data.material;

		}

		function getOutlineMaterial(originalMaterial: MeshPhongMaterial) {

			const outlineMaterial = getOutlineMaterialFromCache(originalMaterial);

			originalMaterials[outlineMaterial.uuid] = originalMaterial;

			updateOutlineMaterial(outlineMaterial, originalMaterial);

			return outlineMaterial;

		}

		function isCompatible(object: { geometry: any; isMesh: boolean; material: any; }) {

			const geometry = object.geometry;
			const hasNormals = (geometry !== undefined) && (geometry.attributes.normal !== undefined);

			return (object.isMesh === true && object.material !== undefined && hasNormals === true);

		}

		function setOutlineMaterial(object: any) {

			if (isCompatible(object) === false) return;

			if (Array.isArray(object.material)) {

				for (let i = 0, il = object.material.length; i < il; i++) {

					object.material[i] = getOutlineMaterial(object.material[i]);

				}

			} else {

				object.material = getOutlineMaterial(object.material);

			}

			originalOnBeforeRenders[object.uuid] = object.onBeforeRender;
			object.onBeforeRender = onBeforeRender;

		}

		function restoreOriginalMaterial(object: any) {

			if (isCompatible(object) === false) return;

			if (Array.isArray(object.material)) {

				for (let i = 0, il = object.material.length; i < il; i++) {

					object.material[i] = originalMaterials[object.material[i].uuid];

				}

			} else {

				object.material = originalMaterials[object.material.uuid];

			}

			object.onBeforeRender = originalOnBeforeRenders[object.uuid];

		}

		function onBeforeRender(renderer: any, scene: any, camera: any, geometry: any, material: ShaderMaterial) {

			const originalMaterial = originalMaterials[material.uuid];

			// just in case
			if (originalMaterial === undefined) return;

			updateUniforms(material, originalMaterial);

		}

		function updateUniforms(material: ShaderMaterial, originalMaterial: MeshPhongMaterial) {

			const outlineParameters = originalMaterial.userData.outlineParameters;

			material.uniforms.outlineAlpha.value = originalMaterial.opacity;

			if (outlineParameters !== undefined) {

				if (outlineParameters.thickness !== undefined) material.uniforms.outlineThickness.value = outlineParameters.thickness;
				if (outlineParameters.color !== undefined) material.uniforms.outlineColor.value.fromArray(outlineParameters.color);
				if (outlineParameters.alpha !== undefined) material.uniforms.outlineAlpha.value = outlineParameters.alpha;

			}

			if (originalMaterial instanceof MeshPhongMaterial) {

				material.uniforms.displacementMap.value = originalMaterial.displacementMap;
				material.uniforms.displacementScale.value = originalMaterial.displacementScale;
				material.uniforms.displacementBias.value = originalMaterial.displacementBias;

			}

		}

		function updateOutlineMaterial(material: OutlineMaterial, originalMaterial: MeshPhongMaterial) {

			if (material.name === 'invisible') return;

			const outlineParameters = originalMaterial.userData.outlineParameters;

			material.fog = originalMaterial.fog;
			material.toneMapped = originalMaterial.toneMapped;
			material.premultipliedAlpha = originalMaterial.premultipliedAlpha;
			material.displacementMap = originalMaterial.displacementMap;

			if (outlineParameters !== undefined) {

				if (originalMaterial.visible === false) {

					material.visible = false;

				} else {

					material.visible = (outlineParameters.visible !== undefined) ? outlineParameters.visible : true;

				}

				material.transparent = (outlineParameters.alpha !== undefined && outlineParameters.alpha < 1.0) ? true : originalMaterial.transparent;

				if (outlineParameters.keepAlive !== undefined) cache[originalMaterial.uuid].keepAlive = outlineParameters.keepAlive;

			} else {

				material.transparent = originalMaterial.transparent;
				material.visible = originalMaterial.visible;

			}

			if (originalMaterial.wireframe === true || originalMaterial.depthTest === false) material.visible = false;

			if (originalMaterial.clippingPlanes) {

				material.clipping = true;

				material.clippingPlanes = originalMaterial.clippingPlanes;
				material.clipIntersection = originalMaterial.clipIntersection;
				material.clipShadows = originalMaterial.clipShadows;

			}

			material.version = originalMaterial.version; // update outline material if necessary

		}

		function cleanupCache() {

			let keys;

			// clear originialMaterials
			keys = Object.keys(originalMaterials);

			for (let i = 0, il = keys.length; i < il; i++) {

				originalMaterials[keys[i]] = undefined;

			}

			// clear originalOnBeforeRenders
			keys = Object.keys(originalOnBeforeRenders);

			for (let i = 0, il = keys.length; i < il; i++) {

				originalOnBeforeRenders[keys[i]] = undefined;

			}

			// remove unused outlineMaterial from cache
			keys = Object.keys(cache);

			for (let i = 0, il = keys.length; i < il; i++) {

				const key = keys[i];

				if (cache[key].used === false) {

					cache[key].count++;

					if (cache[key].keepAlive === false && cache[key].count > removeThresholdCount) {

						delete cache[key];

					}

				} else {

					cache[key].used = false;
					cache[key].count = 0;

				}

			}

		}

		this.renderOutline = function (renderer: { autoClear: boolean; shadowMap: { enabled: boolean; }; setRenderTarget: (arg0: any) => void; render: (arg0: Scene, arg1: Camera) => void; }, inputBuffer: { texture: any; }, outputBuffer: any) {
			const scene = this.renderScene

			const currentAutoClear = renderer.autoClear;
			const currentSceneAutoUpdate = scene.matrixWorldAutoUpdate;
			const currentSceneBackground = scene.background;
			const currentShadowMapEnabled = renderer.shadowMap.enabled;

			scene.matrixWorldAutoUpdate = false;
			scene.background = null;
			renderer.autoClear = false;
			renderer.shadowMap.enabled = false;

			scene.traverse(setOutlineMaterial);

			renderer.setRenderTarget(inputBuffer);
			renderer.render(scene, this.renderCamera);

			scene.traverse(restoreOriginalMaterial);

			cleanupCache();

			scene.matrixWorldAutoUpdate = currentSceneAutoUpdate;
			scene.background = currentSceneBackground;
			renderer.autoClear = currentAutoClear;
			renderer.shadowMap.enabled = currentShadowMapEnabled;

			this.fullscreenMaterial = this.copyMaterial;
			this.copyMaterial.inputBuffer = inputBuffer.texture;
			renderer.setRenderTarget(this.renderToScreen ? null : outputBuffer);
			renderer.render(this.scene, this.camera);

		};

	}

	render(renderer: any, writeBuffer: null, readBuffer: any) {

		this.renderOutline(renderer, writeBuffer, readBuffer);

	};

	// setSize( width, height ) {

	// 	this.renderTargetDepth.setSize( width, height );

	// }

}

export { OutlinePass };
