import { GlobalState } from "@/app/stores/useGlobalStore"
import { use } from "react"

function PromisePrimitive({ promise, dispose }: { promise: Promise<GlobalState["character"]>, dispose: Function }) {
    const character = use(promise)
    return (
        <primitive object={character} dispose={dispose} />
    )
}

export default PromisePrimitive