import { Suspense, use } from "react"
import { SkinnedMesh } from "three"

function PromisePrimitive({ promise }: { promise: Promise<SkinnedMesh>}) {
    if(!promise) return null
    const modelMesh = use(promise)
    return (
        <primitive object={modelMesh} dispose={null} />
    )
}

function WithSuspense({ promise }: { promise: Promise<SkinnedMesh>}) {
    return ( 
        <Suspense fallback={null}>
            <PromisePrimitive promise={promise}></PromisePrimitive>
        </Suspense>
     );
}

export default WithSuspense;