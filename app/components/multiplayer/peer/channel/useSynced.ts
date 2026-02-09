import { useState, useEffect } from "react"
import JSONDataChannel from "./JSONDataChannel"

function useSynced(channel: JSONDataChannel) {
    const [synced, setSynced] = useState(false)
    useEffect(() => {
        if (synced) return
        const onMessage = (e: MessageEvent) => {
            const { type } = e.data
            if (type == "syncing") {
                channel.send({ type: "synced" })
                setSynced(true)
            }
            if (type == "synced") {
                setSynced(true)
            }
        }
        channel.send({ type: "syncing" })
        channel.addEventListener("message", onMessage)
        return () => {
            channel.removeEventListener("message", onMessage)
        }
    }, [synced])

    return synced;
}

export default useSynced;