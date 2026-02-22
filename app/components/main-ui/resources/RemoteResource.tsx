import { MouseEvent, useEffect, useRef, useState } from "react";
import JSONDataChannel from "../../multiplayer/peer/channel/JSONDataChannel";
import ResourceCard from "../resources/ResourceCard";
import useSynced from "../../multiplayer/peer/channel/useSynced";

function RemoteResource({ type, name, channel, onLoad }: { type: ResourceType, name: string, channel: JSONDataChannel, onLoad: (name: string, data: string) => void }) {
    const uriPrefix = `${type}/${name}`
    const onClick = (e: MouseEvent) => {
        channel.send({
            uri: `${uriPrefix}/requestResource`
        })
    }
    const receiveBufferRef = useRef<string[]>()
    const receiveBufferSizeRef = useRef<number>(0)
    const resourceSizeRef = useRef<number>()
    const [previewImgSrc, setPreviewImgSrc] = useState<string>()
    useSynced(channel, uriPrefix)
    
    useEffect(() => {
        const loading = document.getElementById("loading")
        const onMessage = (e: MessageEvent<DataSchema>) => {
            const { uri, payload } = e.data
            if (!uri.startsWith(uriPrefix)) return
            const pathname = uri.split(uriPrefix)[1]
            if (pathname == "previewImg") {
                setPreviewImgSrc(payload)
            }
            if (pathname == "resourceSize") {
                resourceSizeRef.current = payload
            }
            if (pathname == "resourceData") {
                receiveBufferRef.current.push(payload);
                if (loading) {
                    loading.textContent = "Loading " + Math.round(receiveBufferSizeRef.current * 100 / resourceSizeRef.current) + "%..."
                }
                receiveBufferSizeRef.current += payload.length
                if (receiveBufferSizeRef.current == resourceSizeRef.current) {
                    onLoad(name, receiveBufferRef.current.join())
                }
            }
        }
        channel.addEventListener("message", onMessage)
        return () => channel.removeEventListener("message", onMessage)
    }, [])

    return (
        <ResourceCard
            name={name}
            previewImgSrc={previewImgSrc}
            onClick={onClick}
        >
        </ResourceCard>
    );
}

export default RemoteResource;