import { useEffect, useState } from "react";
import RemoteResource from "./RemoteResource";
import useFileTransfer from "../../multiplayer/fileTransfer/useFileTransfer";
import { useResource } from "../context";
import useGlobalStore from "@/app/stores/useGlobalStore";

function RemoteResources() {
    const [resourceNames, setResourceNames] = useState<string[]>([])
    const { type } = useResource()
    const filesHashes = useGlobalStore(state => state.filesHashes)[type]
    const { channel, synced } = useFileTransfer(type)
    useEffect(() => {
        const onMessage = (e: MessageEvent<DataSchema>) => {
            const { uri, payload: remoteHashes } = e.data
            if (uri == `${type}/resourceHashes`) {
                const fileHashes = Object.values(filesHashes)
                const names = Object.keys(remoteHashes)
                    .filter(name =>
                        !fileHashes.includes(remoteHashes[name])
                    )
                setResourceNames(names)
            }
        }
        channel.addEventListener("message", onMessage)
        return () => channel.removeEventListener("message", onMessage)
    }, [type, filesHashes])

    useEffect(() => {
        if (!synced) return
        channel.send({
            uri: `${type}/requestResourceHashes`
        })
    }, [type, synced])

    return (
        <>
            {
                Array.from(resourceNames)
                    .map(name =>
                        <RemoteResource key={name} name={name} />
                    )
            }
        </>
    );
}

export default RemoteResources;