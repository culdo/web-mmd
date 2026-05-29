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

    const normals = useRef<THREE.BufferAttribute>(null)
    const normalsOrig = useRef<THREE.BufferAttribute>(null)

    const [controllers, setContollers] = useState<Schema>()

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

        const buildMapItem = (materialKey: string, userDataKey?: string, modifyTexture?: Function) => {
            const handler: OnChangeHandler = (texturePath: keyof typeof mapOptions) => {
                const texture = mapOptions[texturePath]
                if (texture === undefined || _.get(material, `${materialKey}.name`) === texturePath) return
                _.set(material, materialKey, texture);
                if(materialKey == 'map') {
                    material.map.colorSpace = THREE.SRGBColorSpace
                    material.map.needsUpdate = true
                }
                modifyTexture?.(texture)
                material.needsUpdate = true;
            }
            if (userDataKey === undefined) {
                userDataKey = materialKey
            }
            return buildMGuiItem(`userData.${userDataKey}`, [handler, Object.keys(mapOptions)])
        }

        const origFragmentShader = material.userData.fragmentShader;
        const origVertexShader = material.userData.vertexShader;
        const onBeforeCompiles: Record<string, typeof material.onBeforeCompile> = {}
        material.onBeforeCompile = (parameters, renderer) => {
            parameters.vertexShader = origVertexShader
            parameters.fragmentShader = origFragmentShader
            for (const [key, onBeforeCompile] of Object.entries(onBeforeCompiles)) {
                onBeforeCompile(parameters, renderer)
            }
        }
        const smoothnessToRoughness = (texture: THREE.Texture) => {
            if (!texture) {
                delete onBeforeCompiles["smoothness"]
            } else {
                onBeforeCompiles["smoothness"] = (parameters, renderer) => {
                    parameters.fragmentShader = parameters.fragmentShader.replace(
                        '#include <roughnessmap_fragment>',
                        `float roughnessFactor = roughness;
                        #ifdef USE_ROUGHNESSMAP
                            vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
                            roughnessFactor *= 1.0 - texelRoughness.g;
                        #endif`
                    );
                }
            }
            const cacheKey = Math.random().toString()
            material.customProgramCacheKey = () => cacheKey;
        }

        const RNMapping = (texture: THREE.Texture) => {
            if (!texture) {
                delete onBeforeCompiles["RNMapping"]
            } else {
                onBeforeCompiles["RNMapping"] = (parameters, renderer) => {
                    parameters.uniforms.detailMap = { value: texture };
                    parameters.uniforms.subNormalMapTransform = { value: texture.matrix };

                    parameters.vertexShader = parameters.vertexShader
                        .replace(
                            '#include <uv_pars_vertex>',
                            `
                            #include <uv_pars_vertex>
                            uniform mat3 subNormalMapTransform;
                            varying vec2 vSubNormalMapUv;
                            `
                        )
                        .replace(
                            '#include <uv_vertex>',
                            `
                            #include <uv_vertex>
                            vSubNormalMapUv = ( subNormalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
                            `
                        )

                    parameters.fragmentShader = parameters.fragmentShader
                        .replace(
                            '#include <uv_pars_fragment>',
                            `
                            #include <uv_pars_fragment>
                            varying vec2 vSubNormalMapUv;
                            `
                        )
                        .replace(
                            '#include <normalmap_pars_fragment>',
                            `
                            #include <normalmap_pars_fragment>
                            uniform sampler2D detailMap;
                            `
                        )
                        .replace(
                            '#include <normal_fragment_maps>',
                            `
                            vec3 t = texture2D(normalMap, vNormalMapUv).xyz * vec3(2, 2, 2) + vec3(-1, -1, 0);
                            vec3 u = texture2D(detailMap, vSubNormalMapUv).xyz * vec3(-2, -2, 2) + vec3(1, 1, -1);
                            vec3 mapN = (normalize(t * dot(t, u) - u * t.z) + 1.0) / 2.0;
                            mapN.xy *= normalScale;
                            normal = normalize( tbn * mapN );
                            `
                        );
                }
            }
            const cacheKey = Math.random().toString()
            material.customProgramCacheKey = () => cacheKey;
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
            'smoothnessMap': buildMapItem("roughnessMap", "smoothnessMap", smoothnessToRoughness),
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
            'subNormalMap': buildMapItem("", "subNormalMap", RNMapping),
            'subNormalMapLoop': {
                value: 1,
                onChange: (val) => {
                    const subNormalMap = mapOptions[material.userData.subNormalMap]
                    if (!subNormalMap) return
                    subNormalMap.repeat.set(val, val)
                    subNormalMap.updateMatrix()
                }
            },
            'envMap': buildMapItem("envMap"),
            'envMapIntensity': buildMGuiItem("envMapIntensity"),
            "reset All": button(() => {
                usePresetStore.setState({ materials: defaultConfig.materials })
            }),
            "debug": folder({
                'only show this': {
                    value: false,
                    onChange: (state) => {
                        for (const m of materials) {
                            if (m == material && state) continue
                            m.visible = !state
                        }
                    }
                },
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

        for (const [idx, material] of materials.entries()) {
            const userData = {
                faceForward: 0,
                map: material.map?.name ?? "none",
                emissiveMap: "none",
                roughnessMap: "none",
                smoothnessMap: "none",
                metalnessMap: "none",
                normalMap: "none",
                subNormalMap: "none",
                envMap: "none",
            }
            _.merge(material.userData, userData)
            const savedMaterial = savedMaterials[material.name]
            if (savedMaterial) {
                _.merge(material, savedMaterial)
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

    useControls(`Model.${model.name}.Material`, {
        "targetMaterial": {
            ...buildGuiItem("targetMaterialIdx"),
            options: materialMap,
        },
        ...controllers
    }, { collapsed: true, render: () => isRenderGui(model.name) }, [controllers, materialMap])

    return <></>;
}

export default Material;