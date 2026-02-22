import { useEffect, useState } from "react";
import JSONDataChannel from "../../multiplayer/peer/channel/JSONDataChannel";
import RemoteResource from "./RemoteResource";
import { SenderContext } from "../../multiplayer/fileTransfer";
import useSynced from "../../multiplayer/peer/channel/useSynced";

function RemoteResources({ type, sender, channel, onLoad }: { type: ResourceType, sender: string, channel: JSONDataChannel, onLoad: (name: string, data: string) => void }) {
    const [resourceNames, setResourceNames] = useState<string[]>([])

    useEffect(() => {
        const onMessage = (e: MessageEvent<DataSchema>) => {
            const { uri, payload } = e.data
            if (uri == `${type}/resourceNames`) {
                setResourceNames(payload)
            }
        }
        channel.addEventListener("message", onMessage)
        return () => channel.removeEventListener("message", onMessage)
    }, [])

    const synced = useSynced(channel, type)
    useEffect(() => {
        if (!synced) return
        channel.send({
            uri: `${type}/requestResourceNames`
        })
    }, [synced])

    return (
        <SenderContext.Provider value={sender}>
            {
                Array.from(resourceNames)
                    .map(name =>
                        <RemoteResource key={name} type={type} name={name} channel={channel} onLoad={onLoad} />
                    )
            }
        </SenderContext.Provider>
    );
}

export default RemoteResources;