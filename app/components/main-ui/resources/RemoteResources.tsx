import { useEffect, useState } from "react";
import RemoteResource from "./RemoteResource";
import useFileTransfer from "../../multiplayer/fileTransfer/useFileTransfer";
import { useResource } from "../context";
import { fileHashes } from "../../multiplayer/fileTransfer/useGenHash";

function RemoteResources() {
    const [resourceNames, setResourceNames] = useState<Set<string>>(new Set([]))
    const { type } = useResource()
    const { channel, synced } = useFileTransfer(type)
    useEffect(() => {
        const onMessage = (e: MessageEvent<DataSchema>) => {
            const { uri, payload } = e.data
            if (uri == `${type}/resourceHashes`) {
                if (Object.values(fileHashes).includes(payload.hash)) return
                setResourceNames(names => {
                    names.add(payload.name)
                    return new Set(names)
                })
            }
            if (uri == `${type}/resourceDestroy`) {
                setResourceNames(names => {
                    names.delete(payload.name)
                    return new Set(names)
                })
            }
        }
        channel.addEventListener("message", onMessage)
        return () => {
            setResourceNames(new Set([]))
            channel.removeEventListener("message", onMessage)
        }
    }, [type])

    useEffect(() => {
        if (!synced) return
        channel.send({
            uri: `${type}/requestResourceHashes`
        })
    }, [type, synced])

    return (
        <>
            {
                [...resourceNames]
                    .map(name =>
                        <RemoteResource key={name} name={name} />
                    )
            }
        </>
    );
}

export default RemoteResources;