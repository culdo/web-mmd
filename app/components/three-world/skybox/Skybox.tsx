import usePresetStore from "@/app/stores/usePresetStore";
import { buildGuiItem } from "@/app/utils/gui";
import { useLoader, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect } from "react";
import * as THREE from "three";
import { PMREMGenerator as PMREMGeneratorWebGL } from "three";
import { RGBELoader } from "three/examples/jsm/Addons.js";
import { PMREMGenerator as PMREMGeneratorWebGPU, WebGPURenderer } from "three/webgpu";

function Skybox({ hdrUrl }: { hdrUrl: string }) {
    const { gl, scene } = useThree();
    const texture = useLoader(RGBELoader, hdrUrl);

    useControls("Skybox", {
        "envIntensity": {
            ...buildGuiItem("envIntensity", (value) => {
                scene.environmentIntensity = value
            }),
            max: 1.0,
            min: 0.0
        },
        "envRotation": buildGuiItem("envRotation", (value) => {
            scene.environmentRotation = value
        })
    }, { order: 2, collapsed: true })
    useEffect(() => {
        let pmremGenerator: PMREMGeneratorWebGL
        if (gl instanceof WebGPURenderer) {
            pmremGenerator = new PMREMGeneratorWebGPU(gl as any) as unknown as PMREMGeneratorWebGL;
        } else {
            pmremGenerator = new PMREMGeneratorWebGL(gl);
        }
        pmremGenerator.compileEquirectangularShader();
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;

        envMap.colorSpace = THREE.SRGBColorSpace;
        envMap.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = envMap

        return () => {
            scene.environment = null
        }
    }, [hdrUrl, gl])
    return <></>
}

export default Skybox;