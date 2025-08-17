import { Ref, forwardRef, useMemo, useEffect, useContext } from 'react'
import { ReactThreeFiber } from '@react-three/fiber'
import { type DepthPackingStrategies, PerspectiveCamera, type Texture, Vector3 } from 'three'
import { EffectComposerContext } from '@react-three/postprocessing'
import { HexDofEffect } from '@/app/modules/effects/HexDofEffect'

type DOFProps = ConstructorParameters<typeof HexDofEffect>[2] &
  Partial<{
    target: ReactThreeFiber.Vector3
    depthTexture: {
      texture: Texture
      // TODO: narrow to DepthPackingStrategies
      packing: number
    }
    // TODO: not used
    blur: number
    hexDof: boolean
  }>

export const DepthOfField = forwardRef(function DepthOfField(
  {
    blendFunction,
    resolutionScale,
    resolutionX,
    resolutionY,
    width,
    height,
    target,
    depthTexture,
    hexDof,
    ...props
  }: DOFProps,
  ref: Ref<HexDofEffect>
) {
  const { camera, scene } = useContext(EffectComposerContext)
  const autoFocus = target != null
  const effect = useMemo(() => {
    const effect = new HexDofEffect(scene, camera as PerspectiveCamera, {
      blendFunction,
      resolutionScale,
      resolutionX,
      resolutionY,
      width,
      height,
    })
    // Creating a target enables autofocus, R3F will set via props
    if (autoFocus) effect.target = new Vector3()
    // Depth texture for depth picking with optional packing strategy
    if (depthTexture) effect.setDepthTexture(depthTexture.texture, depthTexture.packing as DepthPackingStrategies)
    return effect
  }, [
    camera,
    blendFunction,
    resolutionScale,
    resolutionX,
    resolutionY,
    width,
    height,
    autoFocus,
    depthTexture,
    hexDof
  ])

  useEffect(() => {
    return () => {
      effect.dispose()
    }
  }, [effect])

  return <primitive {...props} ref={ref} object={effect} target={target} />
})