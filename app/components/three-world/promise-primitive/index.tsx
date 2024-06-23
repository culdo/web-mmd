import { use } from "react"
import { SkinnedMesh } from "three"

function PromisePrimitive({ promise }: { promise: Promise<SkinnedMesh>}) {
    if(!promise) return null
    const modelMesh = use(promise)
    return (
        <primitive object={modelMesh} dispose={null} />
    )
}

export default PromisePrimitive