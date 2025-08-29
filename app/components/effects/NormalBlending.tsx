import { NormalBlendingPass } from '@/app/modules/effects/NormalBlendingPass'
import useGlobalStore from '@/app/stores/useGlobalStore'
import usePresetStore from '@/app/stores/usePresetStore'
import { forwardRef, Ref, useMemo } from 'react'
import { MeshPhysicalMaterial, Texture } from 'three'

export const NormalBlending = forwardRef(function Effect(
  { normalMap, subNormalMap }: { normalMap: Texture, subNormalMap: Texture },
  ref: Ref<NormalBlendingPass>
) {
  const targetModelId = usePresetStore(state => state.targetModelId)
  const targetMaterialIdx = usePresetStore(state => state.targetMaterialIdx)
  const model = useGlobalStore(state => state.models)[targetModelId]
  const material = (model.material as MeshPhysicalMaterial[])[targetMaterialIdx]

  const effect = useMemo(
    () => {
      const pass = new NormalBlendingPass(normalMap, subNormalMap)
      material.normalMap = pass.outputBuffer.texture
      material.needsUpdate = true
      return pass
    },
    
    [normalMap, subNormalMap]
  )

  return <primitive ref={ref} object={effect} dispose={null} />
})