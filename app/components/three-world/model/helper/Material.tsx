import defaultConfig from '@/app/presets/Default_config.json';
import usePresetStore from "@/app/stores/usePresetStore";
import { buildMaterialGuiFunc } from "@/app/utils/gui";
import { button, folder, useControls } from "leva";
import { OnChangeHandler, Schema } from "leva/dist/declarations/src/types";
import _ from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useModel } from './ModelContext';
import isRenderGui from './useRenderGui';

function Material() {
    const textureLoader = new THREE.TextureLoader()
    const model = useModel()
    const materials = model.material as THREE.MeshPhysicalMaterial[]
    const geometry = model.geometry

    const [targetMaterialIdx, setTargetMaterialIdx] = useState(0)
    const savedMaterials = usePresetStore(states => states.materials)[model.name] ?? {}

    const normals = useRef<THREE.BufferAttribute>()
    const normalsOrig = useRef<THREE.BufferAttribute>()

    const [controllers, setContollers] = useState<Schema>()

    function updateTexture(material: { [x: string]: any; needsUpdate: boolean; }, materialKey: string, textures: Record<string, any>) {
        const handler: OnChangeHandler = (key: string) => {
            material[materialKey] = textures[key];
            material.needsUpdate = true;
        }
        return [handler, textures] as const;
    }

    const skin = textureLoader.load("https://raw.githubusercontent.com/ray-cast/ray-mmd/master/Materials/_MaterialMap/skin.png");
    skin.wrapS = THREE.RepeatWrapping;
    skin.wrapT = THREE.RepeatWrapping;
    skin.repeat.set(80, 80);

    const normalMaps = {
        none: null as null,
        skin
    };

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

    const buildFaceForwardFn = (idx: number) => {
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

    const buildMaterialGuiItem = buildMaterialGuiFunc(model, targetMaterialIdx)

    const updateControls = (idx: number) => {
        const material = materials[idx]

        setContollers({
            "faceForward": buildMaterialGuiItem("userData.faceForward", buildFaceForwardFn(idx), 0, 1),
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
                usePresetStore.setState({ materials: defaultConfig.materials })
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

    const initTargetMaterials = () => {
        normalsOrig.current = geometry.attributes.normal.clone()
        normals.current = geometry.attributes.normal as THREE.BufferAttribute

        for (const [idx, item] of materials.entries()) {
            const userData = {
                faceForward: 0,
                normalMap: "none"
            }
            _.merge(item.userData, userData)
            const savedMaterial = savedMaterials[item.name]
            if (savedMaterial) {
                _.merge(item, savedMaterial)
                if (savedMaterial.userData?.faceForward) {
                    buildFaceForwardFn(idx)(savedMaterial.userData.faceForward)
                }
            }
        }

    }

    useEffect(() => {
        initTargetMaterials();
    }, [model])

    const materialMap = useMemo(() =>
        Object.fromEntries(
            materials.map((m, i) => [m.name, i])
        ), [model])

    useEffect(() => {
        updateControls(targetMaterialIdx);
    }, [targetMaterialIdx])

    useControls(`Model-${model.name}.Material`, {
        "targetMaterial": {
            value: targetMaterialIdx,
            options: materialMap,
            onChange: (val) => setTargetMaterialIdx(val)
        },
        ...controllers
    }, { collapsed: true, render: () => isRenderGui(model.name) }, [controllers, materialMap])

    return <></>;
}

export default Material;