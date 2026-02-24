import { useEffect } from "react";
import { useResource } from "../../main-ui/context";
import { createHash } from "crypto";
import useConfigStore from "@/app/stores/useConfigStore";


function useGenHash(name: string) {
    const { type, onRead } = useResource()
    const currentPreset = useConfigStore(state => state.preset)
    const presetName = type == "Presets" ? name : currentPreset
    const fileHashes = useConfigStore(state => state.fileHashes)
    const uri = `${type}/${name}`

    useEffect(() => {
        if (fileHashes[presetName]?.[uri]) return
        const compute = async () => {
            const data = await onRead(name)
            const sha256 = createHash('sha256')
            const hash = sha256.update(data).digest("hex")
            console.log(`compute ${uri} hash: ${hash}`)
            useConfigStore.setState(({ fileHashes }) => {
                const fileHashesByPreset = fileHashes[presetName]
                if (!fileHashesByPreset) {
                    fileHashes[presetName] = {}
                }
                fileHashes[presetName][uri] = hash
                return { fileHashes: { ...fileHashes } }
            })
        }
        compute()
    }, [presetName])
}

export default useGenHash;