import { EffectComposer } from "@react-three/postprocessing";
import OutlinePass from "./OutlinePass";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

function Effects() {
    const { gl } = useThree()
    gl.setPixelRatio(1.0)
    return (
        <EffectComposer>
            <OutlinePass></OutlinePass>
        </EffectComposer>
    );
}

export default Effects;