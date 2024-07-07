import React, { forwardRef, useMemo } from 'react'
import { CopyMaterial, ShaderPass as ShaderPassImpl } from 'postprocessing'

const ShaderPass = forwardRef(({}, ref) => {
    const effect = useMemo(() => new ShaderPassImpl(new CopyMaterial()), [])
    return <primitive ref={ref} object={effect} dispose={null} />
  })

export default ShaderPass;