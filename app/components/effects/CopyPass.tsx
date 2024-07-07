import React, { forwardRef, useMemo } from 'react'
import { CopyPass as CopyPassImpl } from 'postprocessing'

const CopyPass = forwardRef(({}, ref) => {
    const effect = useMemo(() => new CopyPassImpl(), [])
    return <primitive ref={ref} object={effect} dispose={null} />
  })

export default CopyPass;