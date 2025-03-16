import { MeshPhysicalMaterial, MeshStandardMaterialParameters, ShaderLib } from "three";

export class MMDPhysicalMaterial extends MeshPhysicalMaterial {
    
    constructor(parameters: MeshStandardMaterialParameters) {
		super();
        this.setValues(parameters)
    }
}