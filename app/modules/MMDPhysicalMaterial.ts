import { MeshPhysicalMaterial, MeshStandardMaterialParameters, ShaderLib } from "three";
import { initSdef } from "./shaders/SdefVertexShader";

export class MMDPhysicalMaterial extends MeshPhysicalMaterial {
    vertexShader: string;
    fragmentShader: string;
    
    constructor(parameters: MeshStandardMaterialParameters) {
		super();
        
        this.vertexShader = initSdef(ShaderLib.physical.vertexShader, parameters.userData.enableSdef)
        this.fragmentShader = ShaderLib.physical.fragmentShader

        this.setValues(parameters)
    }
}