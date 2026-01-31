import { Node, NodeBuilder, MeshPhysicalNodeMaterial, SkinnedMesh } from "three/webgpu";

class MMDMaterial extends MeshPhysicalNodeMaterial {
	vertexOutput: Node
	buildSkinningNode: (mesh: SkinnedMesh) => Node

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
