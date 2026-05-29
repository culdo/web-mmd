import { buildGuiItem } from "@/app/utils/gui";
import { useLoader, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect } from "react";
import * as THREE from "three";
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';

function Skybox({ hdrUrl }: { hdrUrl: string }) {
    const { gl, scene } = useThree();
    const texture = useLoader(HDRLoader, hdrUrl);

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
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture

        return () => {
            scene.environment = null
        }
    }, [hdrUrl, gl])
    return <></>
}

export default Skybox;