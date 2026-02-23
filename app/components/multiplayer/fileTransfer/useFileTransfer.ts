import useGlobalStore from "@/app/stores/useGlobalStore";
import { useContext, useEffect, useState } from "react";
import { SenderContext } from ".";
import JSONDataChannel from "../peer/channel/JSONDataChannel";

function useFileTransfer(uriPrefix: string) {
    const sender = useContext(SenderContext)
    const channel = useGlobalStore(state => state.peerChannels)[sender]?.channels["fileTransfer"] as JSONDataChannel
    const [synced, setSynced] = useState(false)
    useEffect(() => {
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
    }, [])
    return { channel, synced }
}

export default useFileTransfer;