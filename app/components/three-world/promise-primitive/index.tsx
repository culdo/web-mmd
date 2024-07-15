import { use } from "react"
import { SkinnedMesh } from "three"
import WithSuspense from "../../suspense"

function PromisePrimitive({ promise, ...props }: { promise: Promise<SkinnedMesh> }) {
    if (!promise) return null
    const modelMesh = use(promise)
    return (
        <primitive object={modelMesh} dispose={null} {...props} />
    )
}

export default WithSuspense(PromisePrimitive);
