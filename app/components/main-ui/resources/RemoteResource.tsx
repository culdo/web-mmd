import { MouseEvent, useContext, useEffect, useRef, useState } from "react";
import JSONDataChannel from "../../multiplayer/peer/channel/JSONDataChannel";
import ResourceCard from "../resources/ResourceCard";
import useSynced from "../../multiplayer/peer/channel/useSynced";
import { SenderContext } from "../../multiplayer/fileTransfer";
import useGlobalStore from "@/app/stores/useGlobalStore";

function RemoteResource({ type, name, channel, onLoad }: { type: ResourceType, name: string, channel: JSONDataChannel, onLoad: (name: string, data: string) => void }) {
    const sender = useContext(SenderContext)
    const fullname = `${name}@${sender}`
    const uriPrefix = `${type}/${name}`
    const onClick = (e: MouseEvent) => {
        channel.send({
            uri: `${uriPrefix}/requestResource`
        })
        useGlobalStore.setState({ openMainUI: false })
    }
    const receiveBufferRef = useRef<string[]>([])
    const receiveBufferSizeRef = useRef<number>(0)
    const resourceSizeRef = useRef<number>()
    const [previewImgSrc, setPreviewImgSrc] = useState<string>()
    useSynced(channel, uriPrefix)

    useEffect(() => {
        const onMessage = (e: MessageEvent<DataSchema>) => {
            const { uri, payload } = e.data
            if (!uri.startsWith(uriPrefix)) return
            const pathname = uri.split(uriPrefix + "/")[1]
            if (pathname == "previewImg") {
                setPreviewImgSrc(payload)
            }
            if (pathname == "resourceSize") {
                useGlobalStore.setState({ presetReady: false })
                resourceSizeRef.current = payload
            }
            if (pathname == "resourceData") {
                receiveBufferRef.current.push(payload);
                const loading = document.getElementById("loading")
                if (loading) {
                    loading.textContent = "Loading " + Math.round(receiveBufferSizeRef.current * 100 / resourceSizeRef.current) + "%..."
                }
                receiveBufferSizeRef.current += payload.length
                if (receiveBufferSizeRef.current == resourceSizeRef.current) {
                    onLoad(fullname, receiveBufferRef.current.join(""))
                }
            }
        }
        channel.addEventListener("message", onMessage)
        return () => channel.removeEventListener("message", onMessage)
    }, [])

    return (
        <ResourceCard
            name={fullname}
            previewImgSrc={previewImgSrc}
            onClick={onClick}
        >
        </ResourceCard>
    );
}

export default RemoteResource;