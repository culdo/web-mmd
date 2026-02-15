import { useEffect, useState } from "react";
import JSONDataChannel from "../../multiplayer/peer/channel/JSONDataChannel";
import RemoteResource from "./RemoteResource";

function RemoteResources({ type, channel, onLoad }: { type: string, channel: JSONDataChannel, onLoad: (name: string, data: string) => void }) {
    const [presetNames, setResourceNames] = useState<Set<string>>(new Set())

    useEffect(() => {
        const onMessage = (e: MessageEvent) => {
            const { type: dataType, payload } = e.data
            if (dataType == `${type}/resourceName`) {
                setResourceNames((prev) => new Set(prev).add(payload))
            }
        }
        channel.addEventListener("message", onMessage)
        return () => channel.removeEventListener("message", onMessage)
    }, [])

    return (
        <>
            {
                Array.from(presetNames).map(name => <RemoteResource key={name} type={type} name={name} channel={channel} onLoad={onLoad} />)
            }
        </>
    );
}

export default RemoteResources;