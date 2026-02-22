import { useState, useEffect } from "react"
import JSONDataChannel from "./JSONDataChannel"

function useSynced(channel: JSONDataChannel, uriPrefix: string) {
    const [synced, setSynced] = useState(false)
    useEffect(() => {
        if (synced) return
        const onMessage = (e: MessageEvent) => {
            const { uri } = e.data
            if (uri == `${uriPrefix}/syncing`) {
                channel.send({ uri: `${uriPrefix}/synced` })
                setSynced(true)
            }
            if (uri == `${uriPrefix}/synced`) {
                setSynced(true)
            }
        }
        channel.addEventListener("message", onMessage)
        channel.send({ uri: `${uriPrefix}/syncing` })
        return () => {
            channel.removeEventListener("message", onMessage)
        }
    }, [synced])

    return synced;
}

export default useSynced;