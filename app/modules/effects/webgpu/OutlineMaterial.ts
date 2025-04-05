import { ShaderNodeObject } from "three/tsl";
import { NodeMaterial, Node } from "three/webgpu";

class OutlineMaterial extends NodeMaterial {
	updatedVertexNode: ShaderNodeObject<Node>;

	setupVertex( builder: any ) {
		super.setupVertex( builder )
		return this.updatedVertexNode;
	}

}

export default OutlineMaterial;
