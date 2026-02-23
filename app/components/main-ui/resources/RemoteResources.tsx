import { useEffect, useState } from "react";
import RemoteResource from "./RemoteResource";
import useFileTransfer from "../../multiplayer/fileTransfer/useFileTransfer";
import { useResource } from "../context";

function RemoteResources() {
    const [resourceNames, setResourceNames] = useState<string[]>([])
    const { type } = useResource()
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
    }, [type])

    useEffect(() => {
        if (!synced) return
        channel.send({
            uri: `${type}/requestResourceNames`
        })
    }, [type, synced])

    return (
        <>
            {
                Array.from(resourceNames)
                    .map(name =>
                        <RemoteResource key={name} name={name}/>
                    )
            }
        </>
    );
}

export default RemoteResources;