import { useThree } from '@react-three/fiber'
import { RenderPass as RenderPassImpl } from 'postprocessing'
import { forwardRef, useMemo } from 'react'

const RenderPass = forwardRef(({ }, ref) => {
  const scene = useThree(state => state.scene)
  const camera = useThree(state => state.camera)
  
  const effect = useMemo(() => new RenderPassImpl(scene, camera), [scene, camera])
  return <primitive ref={ref} object={effect} dispose={null} />
})

export default RenderPass;