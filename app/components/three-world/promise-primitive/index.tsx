import { use } from "react"
import { SkinnedMesh } from "three"
import WithSuspense from "../../suspense"

function PromisePrimitive({ promise }: { promise: Promise<SkinnedMesh> }) {
    if (!promise) return null
    const modelMesh = use(promise)
    return (
        <primitive object={modelMesh} dispose={null} />
    )
}

export default WithSuspense(PromisePrimitive);
