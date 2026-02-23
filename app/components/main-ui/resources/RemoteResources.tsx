import { useEffect, useState } from "react";
import RemoteResource from "./RemoteResource";
import useFileTransfer from "../../multiplayer/fileTransfer/useFileTransfer";

function RemoteResources({ type, onLoad }: { type: ResourceType, onLoad: (name: string, data: string) => void }) {
    const [resourceNames, setResourceNames] = useState<string[]>([])
    const { channel, synced } = useFileTransfer(type)
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

    useEffect(() => {
        if (!synced) return
        channel.send({
            uri: `${type}/requestResourceNames`
        })
    }, [synced])

    return (
        <>
            {
                Array.from(resourceNames)
                    .map(name =>
                        <RemoteResource key={name} type={type} name={name} onLoad={onLoad} />
                    )
            }
        </>
    );
}

export default RemoteResources;