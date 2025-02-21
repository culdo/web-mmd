import { buildGuiItem } from "@/app/utils/gui";
import { useLoader, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect } from "react";
import * as THREE from "three";
import { RGBELoader } from "three-stdlib";

function Skybox({ hdrUrl }: { hdrUrl: string }) {
    const { gl, scene } = useThree();
    const texture = useLoader(RGBELoader, hdrUrl);

    useControls("Skybox", {
        "envIntensity": buildGuiItem("envIntensity", (value) => {
            scene.environmentIntensity = value
        }),
        "envRotation": buildGuiItem("envRotation", (value) => {
            scene.environmentRotation = value
        })
    }, { order: 2, collapsed: true })
    useEffect(() => {
        const pmremGenerator = new THREE.PMREMGenerator(gl);
        pmremGenerator.compileEquirectangularShader();

        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        envMap.colorSpace = THREE.SRGBColorSpace;
        envMap.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = envMap
    }, [hdrUrl])
    return <></>
}

export default Skybox;