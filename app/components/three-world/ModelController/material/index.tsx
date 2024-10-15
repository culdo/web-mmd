import WithSuspense from "@/app/components/suspense";
import defaultConfig from '@/app/configs/Default_config.json';
import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { buildGuiItem, buildMaterialGuiItem } from "@/app/utils/gui";
import { button, folder, useControls } from "leva";
import { Schema } from "leva/dist/declarations/src/types";
import _ from "lodash";
import { use, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

function Material({ type, modelPromise }: { type: string, modelPromise: Promise<THREE.SkinnedMesh> }) {
    const loader = new THREE.MaterialLoader()
    const textureLoader = new THREE.TextureLoader()
    const model = use(modelPromise)
    const materials = model.material as THREE.MeshPhysicalMaterial[]
    const geometry = model.geometry

    const targetMaterialIdx = usePresetStore(states => states.targetMaterialIdx)
    const material = usePresetStore(states => states.material)
    const presetReady = useGlobalStore(states => states.presetReady)

    const normals = useRef<THREE.BufferAttribute>()
    const normalsOrig = useRef<THREE.BufferAttribute>()

    const [controllers, setContollers] = useState<Schema>()

    function updateTexture(material: { [x: string]: any; needsUpdate: boolean; }, materialKey: string, textures: { [x: string]: any; none?: null; skin?: THREE.Texture; }) {
        return function (key: string | number) {
            material[materialKey] = textures[key];
            material.needsUpdate = true;
        };
    }

    const skin = textureLoader.load("https://raw.githubusercontent.com/ray-cast/ray-mmd/master/Materials/_MaterialMap/skin.png");
    skin.wrapS = THREE.RepeatWrapping;
    skin.wrapT = THREE.RepeatWrapping;
    skin.repeat.set(80, 80);

    const normalMaps: any = {
        none: null,
        skin
    };
    const normalMapsKeys = Object.keys(normalMaps)

    const saveMaterial = () => {
        const target = materials[targetMaterialIdx]
        const targetJson = target.toJSON()
        delete targetJson.map

        material[target.name] = targetJson

        usePresetStore.setState({ material: { ...material } })
    }

    const needsUpdate = (material: THREE.Material) => {
        return () => {
            material.needsUpdate = true;
            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.normal.needsUpdate = true;
        };
    }
    const constants = {
        side: {
            'THREE.FrontSide': THREE.FrontSide,
            'THREE.BackSide': THREE.BackSide,
            'THREE.DoubleSide': THREE.DoubleSide
        }
    }

    const updateFaceForward = (idx: number) => {
        return (ratio: number) => {
            const group = geometry.groups[idx]
            for (let i = 0; i < group.count; i++) {
                const idx = geometry.index.array[group.start + i]
                const start = idx * normals.current.itemSize
                const idxRange = [start, start + normals.current.itemSize]

                const normalOrig = new THREE.Vector3(...normalsOrig.current.array.slice(...idxRange))
                const targetAxis = new THREE.Vector3(0, 0.3, 1)
                normalOrig.lerp(targetAxis, ratio)
                normals.current.set(normalOrig.toArray(), start)
            }
            normals.current.needsUpdate = true;
        }
    }
    const updateControls = (idx: number) => {
        const material = materials[idx]

        setContollers({
            "faceForward": buildMaterialGuiItem("userData.faceForward", updateFaceForward(idx), 0, 1),
            'visible': buildMaterialGuiItem("visible"),
            'color': buildMaterialGuiItem("color"),
            'emissive': buildMaterialGuiItem("emissive"),
            'emissiveIntensity': buildMaterialGuiItem("emissiveIntensity"),
            'roughness': buildMaterialGuiItem("roughness"),
            'metalness': buildMaterialGuiItem("metalness"),
            'ior': buildMaterialGuiItem("ior", null, 1, 2.333),
            'reflectivity': buildMaterialGuiItem("reflectivity"),
            'iridescence': buildMaterialGuiItem("iridescence"),
            'iridescenceIOR': buildMaterialGuiItem("iridescenceIOR", null, 1, 2.333),
            'sheen': buildMaterialGuiItem("sheen"),
            'sheenRoughness': buildMaterialGuiItem("sheenRoughness"),
            'sheenColor': buildMaterialGuiItem("sheenColor"),
            'clearcoat': buildMaterialGuiItem("clearcoat"),
            'clearcoatRoughness': buildMaterialGuiItem("clearcoatRoughness"),
            'specularIntensity': buildMaterialGuiItem("specularIntensity"),
            'specularColor': buildMaterialGuiItem("specularColor"),
            'fog': buildMaterialGuiItem("fog", needsUpdate(material)),
            'normalMap': buildMaterialGuiItem("normalMap", updateTexture(material, 'normalMap', normalMaps)),
            'envMap': buildMaterialGuiItem("envMap", updateTexture(material, 'envMap', normalMaps)),
            'envMapIntensity': buildMaterialGuiItem("envMapIntensity"),
            "reset All": button(() => {
                usePresetStore.setState({ material: defaultConfig.material })
            }),
            "debug": folder({
                'transparent': buildMaterialGuiItem("transparent"),
                'opacity': buildMaterialGuiItem("opacity"),
                'depthTest': buildMaterialGuiItem("depthTest"),
                'depthWrite': buildMaterialGuiItem("depthWrite"),
                'alphaTest': buildMaterialGuiItem("alphaTest"),
                'alphaHash': buildMaterialGuiItem("alphaHash"),
                'side': buildMaterialGuiItem("side"),
                'flatShading': buildMaterialGuiItem("flatShading", needsUpdate(material)),
                'wireframe': buildMaterialGuiItem("wireframe"),
                'vertexColors': buildMaterialGuiItem("vertexColors", needsUpdate(material)),
            }, { collapsed: true })
        })

    }

    const updateTargetMaterial = () => {
        for (const item of materials) {
            const userData = {
                faceForward: 0,
                normalMap: "none"
            }
            _.merge(item.userData, userData)
            const savedMaterial = material[item.name]
            if (savedMaterial) {
                _.merge(item, savedMaterial)
            }
        }

        normalsOrig.current = geometry.attributes.normal.clone()
        normals.current = geometry.attributes.normal as THREE.BufferAttribute
    }

    useEffect(() => {
        updateTargetMaterial();
    }, [model])

    const materialMap = useMemo(() => {
        const result: Record<string, number> = {}
        for (const [i, material] of materials.entries()) {
            result[material.name] = i
        }
        return result
    }, [model])

    useControls(`${type}.Material`, {
        "targetMaterial": {
            ...buildGuiItem("targetMaterialIdx"),
            options: materialMap
        },
        ...controllers
    }, { collapsed: true }, [controllers, materialMap])

    useEffect(() => {
        if (!presetReady) return
        updateControls(targetMaterialIdx);
    }, [targetMaterialIdx, presetReady])

    return <></>;
}

export default WithSuspense(Material);