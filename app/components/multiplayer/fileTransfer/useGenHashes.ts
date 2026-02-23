import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { createHash } from "crypto";
import { useEffect, useMemo, useState } from "react";
import { resourcesMap } from "../../main-ui/context";

const sha256 = createHash('sha256')

function useGenHashes() {
    useGenHash("Presets")
    useGenHash("Models")
    useGenHash("Cameras")
    useGenHash("Motions")
    useGenHash("Musics")
}

function useGenHash(type: ResourceType) {
    const peerChannels = useGlobalStore(state => state.peerChannels)
    const { useNames, useRequest } = resourcesMap[type]
    const names = useNames()
    const onRequest = useRequest()

    useEffect(() => {
        if (Object.keys(peerChannels).length === 0) return
        const compute = async () => {
            const hashes: Record<string, string> = {}
            for (const name of names) {
                const data = await onRequest(name)
                hashes[name] = sha256.update(data).digest("hex")
                useGlobalStore.setState(({ filesHashes }) => {
                    filesHashes[type] = hashes
                    return { filesHashes: { ...filesHashes } }
                })
            }
        }
        compute()
    }, [type, names, onRequest])
}

export default useGenHashes;