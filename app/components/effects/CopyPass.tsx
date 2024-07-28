import { CopyPass as CopyPassImpl } from 'postprocessing';
import { ForwardedRef, forwardRef, useMemo } from 'react';

function CopyPass({ }, ref: ForwardedRef<any>) {
  const effect = useMemo(() => new CopyPassImpl(), [])
  return <primitive ref={ref} object={effect} dispose={null} />
}

export default forwardRef(CopyPass);