import { ShaderNodeObject } from "three/tsl";
import { Node, NodeBuilder, MeshPhysicalNodeMaterial, Object3D, SkinnedMesh } from "three/webgpu";

class MMDMaterial extends MeshPhysicalNodeMaterial {
	vertexOutput: ShaderNodeObject<Node>
	buildSkinningNode: (mesh: SkinnedMesh) => ShaderNodeObject<Node>

	setupVertex( builder: NodeBuilder ) {
		const vertexOutput = super.setupVertex( builder )
		if(this.buildSkinningNode) {
			const context = builder.getContext() as any
			context.vertex.nodes[1] = this.buildSkinningNode(builder.object as SkinnedMesh)
		}
		return this.vertexOutput ?? vertexOutput;
	}

}

export default MMDMaterial;
