import { useEffect, useState } from "react";
import { useResource } from "../../main-ui/context";
import { createHash } from "crypto";

export const fileHashes: Record<string, string> = {}
const sha256 = createHash('sha256')

function useGenHash(name: string) {
    const { type, useRequest } = useResource()
    const onRequest = useRequest()
    const [hash, setHash] = useState(fileHashes[`${type}/${name}`])

    useEffect(() => {
        if (hash) return
        const compute = async () => {
            const data = await onRequest(name)
            const hash = sha256.update(data).digest("hex")
            fileHashes[`${type}/${name}`] = hash
            setHash(hash)
        }
        compute()
    }, [])
    return hash
}

export default useGenHash;