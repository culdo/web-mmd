import { BackSide, Camera, Color, Scene } from "three";
import { normalLocal, cameraProjectionMatrix, modelViewMatrix, float, vec4, positionLocal, nodeObject, normalize } from "three/tsl";
import { PassNode, NodeFrame } from "three/webgpu";
import MMDMaterial from "./MMDMaterial";

/**
 * Represents a render pass for producing a toon outline effect on compatible objects.
 * Only 3D objects with materials of type `MeshToonMaterial` and `MeshToonNodeMaterial`
 * will receive the outline.
 *
 * ```js
 * const postProcessing = new PostProcessing( renderer );
 *
 * const scenePass = toonOutlinePass( scene, camera );
 *
 * postProcessing.outputNode = scenePass;
 * ```
 * @augments PassNode
 */
class OutlinePassNode extends PassNode {
	_materialCache: WeakMap<WeakKey, any>;

	static get type() {

		return 'ToonOutlinePassNode';

	}

	/**
	 * Constructs a new outline pass node.
	 *
	 * @param {Scene} scene - A reference to the scene.
	 * @param {Camera} camera - A reference to the camera.
	 */
	constructor(scene: Scene, camera: Camera) {

		super(PassNode.COLOR, scene, camera);

		/**
		 * An internal material cache.
		 *
		 * @private
		 * @type {WeakMap<Material, NodeMaterial>}
		 */
		this._materialCache = new WeakMap();

	}

	updateBefore(frame: NodeFrame) {

		const { renderer } = frame;

		const currentRenderObjectFunction = renderer.getRenderObjectFunction();

		renderer.setRenderObjectFunction((object: any, scene: Scene, camera: any, geometry: any, material: any, ...params) => {

			// only render outline for supported materials

			if (material.isMeshPhysicalMaterial || material.isMeshToonMaterial || material.isMeshToonNodeMaterial) {

				if (material.wireframe === false && material.userData.outlineParameters?.visible) {
					
					const outlineMaterial = this._getOutlineMaterial(material);
					renderer.renderObject(object, scene, camera, geometry, outlineMaterial, ...params);

				}

			}

			// default

			renderer.renderObject(object, scene, camera, geometry, material, ...params);

		});

		super.updateBefore(frame);

		renderer.setRenderObjectFunction(currentRenderObjectFunction as any);

	}

	/**
	 * Creates the material used for outline rendering.
	 *
	 * @private
	 * @return {NodeMaterial} The outline material.
	 */
	_createMaterial(originalMaterial: MMDMaterial) {

		const outlineParameters = originalMaterial.userData.outlineParameters;

		const alphaNode = nodeObject(outlineParameters.alpha);
		const thickness = nodeObject(outlineParameters.thickness)
		const color = nodeObject((new Color().fromArray(outlineParameters.color)) as any)

		const material = new MMDMaterial();
		material.name = 'MMD_Outline';
		material.side = BackSide;

		// vertex node
		const outlineNormal = normalLocal.negate();
		const mvp = cameraProjectionMatrix.mul(modelViewMatrix);

		const ratio = float(1.0); // TODO: support outline thickness ratio for each vertex
		const pos = mvp.mul(vec4(positionLocal, 1.0));
		const pos2 = mvp.mul(vec4(positionLocal.add(outlineNormal), 1.0));
		const norm = normalize(pos.sub(pos2)); // NOTE: subtract pos2 from pos because BackSide objectNormal is negative

		material.vertexOutput = pos.add(norm.mul(thickness).mul(pos.w).mul(ratio));
		if(originalMaterial.buildSkinningNode) {
			material.buildSkinningNode = originalMaterial.buildSkinningNode
		}

		// color node

		material.colorNode = vec4(color, alphaNode);

		return material;

	}

	/**
	 * For the given toon material, this method returns a corresponding
	 * outline material.
	 *
	 * @private
	 * @param {(MeshToonMaterial|MeshToonNodeMaterial)} originalMaterial - The toon material.
	 * @return {NodeMaterial} The outline material.
	 */
	_getOutlineMaterial(originalMaterial: MMDMaterial) {

		let outlineMaterial = this._materialCache.get(originalMaterial);

		if (outlineMaterial === undefined) {

			outlineMaterial = this._createMaterial(originalMaterial);

			this._materialCache.set(originalMaterial, outlineMaterial);

		}

		return outlineMaterial;

	}

}

export default OutlinePassNode;

/**
 * TSL function for creating a toon outline pass node.
 *
 * @tsl
 * @function
 * @param {Scene} scene - A reference to the scene.
 * @param {Camera} camera - A reference to the camera.
 * @param {Color} color - Defines the outline's color.
 * @param {number} [thickness=0.003] - Defines the outline's thickness.
 * @param {number} [alpha=1] - Defines the outline's alpha.
 * @returns {OutlinePassNode}
 */
export const outlinePass = (scene: Scene, camera: Camera) => nodeObject(new OutlinePassNode(scene, camera));