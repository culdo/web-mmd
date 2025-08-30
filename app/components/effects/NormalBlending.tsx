import { NormalBlendingPass } from '@/app/modules/effects/NormalBlendingPass'
import useGlobalStore from '@/app/stores/useGlobalStore'
import usePresetStore from '@/app/stores/usePresetStore'
import { forwardRef, Ref, useEffect, useMemo } from 'react'
import { MeshPhysicalMaterial, Texture } from 'three'
import WithModel from '../three-world/model/helper/WithModel'

type Material = MeshPhysicalMaterial & {
  "userData.subNormalMap": Texture
}

export const NormalBlending = WithModel(forwardRef(function Effect(
  { },
  ref: Ref<NormalBlendingPass>
) {
  const targetModelId = usePresetStore(state => state.targetModelId)
  const targetMaterialIdx = usePresetStore(state => state.targetMaterialIdx)
  const { material: materials } = useGlobalStore(state => state.models)[targetModelId]
  const material = (materials as Material[])[targetMaterialIdx]
  const { normalMap, "userData.subNormalMap": subNormalMap } = material
  // use as states changed trigger
  const guiMaterials = usePresetStore(state => state.materials)

  const effect = useMemo(
    () => {
      if (!normalMap || !subNormalMap) return null
      const pass = new NormalBlendingPass(normalMap, subNormalMap)
      material.normalMap = pass.outputBuffer.texture
      material.needsUpdate = true
      return pass
    },
    [guiMaterials]
  )

  return effect ? <primitive ref={ref} object={effect} dispose={null} /> : null
}))