import defaultConfig from '@/app/presets/Default_config.json';
import usePresetStore from "@/app/stores/usePresetStore";
import { buildGuiItem, buildMaterialGuiFunc } from "@/app/utils/gui";
import { button, folder, useControls } from "leva";
import { OnChangeHandler, Schema } from "leva/dist/declarations/src/types";
import _ from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useModel } from './ModelContext';
import isRenderGui from './useRenderGui';
import usePngTex from './usePngTex';

function Material() {
    const model = useModel()
    const materials = model.material as THREE.MeshPhysicalMaterial[]
    const geometry = model.geometry

    const targetMaterialIdx = usePresetStore(states => states.targetMaterialIdx)
    const savedMaterials = usePresetStore(states => states.materials)[model.name] ?? {}

    const normals = useRef<THREE.BufferAttribute>()
    const normalsOrig = useRef<THREE.BufferAttribute>()

    const [controllers, setContollers] = useState<Schema>()

    function updateTexture(material: { [x: string]: any; needsUpdate: boolean; }, materialKey: string, textures: Record<string, any>) {
        const handler: OnChangeHandler = (texture: THREE.Texture) => {
            material[materialKey] = texture;
            material.needsUpdate = true;
        }
        return [handler, textures] as const;
    }

    const mapOptions = usePngTex(model)

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

    const buildMGuiItem = buildMaterialGuiFunc(model, targetMaterialIdx)

    const updateControls = (idx: number) => {
        const material = materials[idx]
        const buildMapItem = (key: Parameters<typeof buildMGuiItem>[0]) => {
            return buildMGuiItem(key, updateTexture(material, key, { ...mapOptions }))
        }

        setContollers({
            "faceForward": buildMGuiItem("userData.faceForward", buildFaceForwardFn(idx), 0, 1),
            'visible': buildMGuiItem("visible"),
            'color': buildMGuiItem("color"),
            'map': buildMapItem("map"),
            'emissive': buildMGuiItem("emissive"),
            'emissiveMap': buildMapItem("emissiveMap"),
            'emissiveIntensity': buildMGuiItem("emissiveIntensity"),
            'roughness': buildMGuiItem("roughness"),
            'roughnessMap': buildMapItem("roughnessMap"),
            'metalness': buildMGuiItem("metalness"),
            'metalnessMap': buildMapItem("metalnessMap"),
            'ior': buildMGuiItem("ior", null, 1, 2.333),
            'reflectivity': buildMGuiItem("reflectivity"),
            'iridescence': buildMGuiItem("iridescence"),
            'iridescenceIOR': buildMGuiItem("iridescenceIOR", null, 1, 2.333),
            'sheen': buildMGuiItem("sheen"),
            'sheenRoughness': buildMGuiItem("sheenRoughness"),
            'sheenColor': buildMGuiItem("sheenColor"),
            'clearcoat': buildMGuiItem("clearcoat"),
            'clearcoatRoughness': buildMGuiItem("clearcoatRoughness"),
            'specularIntensity': buildMGuiItem("specularIntensity"),
            'specularColor': buildMGuiItem("specularColor"),
            'fog': buildMGuiItem("fog", needsUpdate(material)),
            'normalMap': buildMapItem("normalMap"),
            'subNormalMap': buildMapItem("userData.subNormalMap"),
            // 'normalScale': buildMGuiItem("normalScale"),
            'envMap': buildMapItem("envMap"),
            'envMapIntensity': buildMGuiItem("envMapIntensity"),
            "reset All": button(() => {
                usePresetStore.setState({ materials: defaultConfig.materials })
            }),
            "debug": folder({
                'transparent': buildMGuiItem("transparent"),
                'opacity': buildMGuiItem("opacity"),
                'depthTest': buildMGuiItem("depthTest"),
                'depthWrite': buildMGuiItem("depthWrite"),
                'alphaTest': buildMGuiItem("alphaTest"),
                'alphaHash': buildMGuiItem("alphaHash"),
                'side': buildMGuiItem("side"),
                'flatShading': buildMGuiItem("flatShading", needsUpdate(material)),
                'wireframe': buildMGuiItem("wireframe"),
                'vertexColors': buildMGuiItem("vertexColors", needsUpdate(material)),
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
            ...buildGuiItem("targetMaterialIdx"),
            options: materialMap,
        },
        ...controllers
    }, { collapsed: true, render: () => isRenderGui(model.name) }, [controllers, materialMap])

    return <></>;
}

export default Material;