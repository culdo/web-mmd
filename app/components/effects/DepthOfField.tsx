import { MaskFunction } from 'postprocessing'
import { Ref, forwardRef, useMemo, useEffect, useContext } from 'react'
import { ReactThreeFiber } from '@react-three/fiber'
import { type DepthPackingStrategies, PerspectiveCamera, type Texture, Vector3 } from 'three'
import { EffectComposerContext } from '@react-three/postprocessing'
import { DepthOfFieldEffect } from '@/app/modules/effects/DepthOfFieldEffect'
import { HexDofEffect } from '@/app/modules/effects/HexDofEffect'

type DOFProps = ConstructorParameters<typeof DepthOfFieldEffect>[2] &
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
    worldFocusDistance,
    worldFocusRange,
    focusDistance,
    focusRange,
    focalLength,
    bokehScale,
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
  ref: Ref<DepthOfFieldEffect>
) {
  const { camera, scene } = useContext(EffectComposerContext)
  const autoFocus = target != null
  const effect = useMemo(() => {
    const dofMethod = hexDof ? HexDofEffect : DepthOfFieldEffect;
    const effect = new dofMethod(scene, camera as PerspectiveCamera, {
      blendFunction,
      worldFocusDistance,
      worldFocusRange,
      focusDistance,
      focusRange,
      focalLength,
      bokehScale,
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
    worldFocusDistance,
    worldFocusRange,
    focusDistance,
    focusRange,
    focalLength,
    bokehScale,
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