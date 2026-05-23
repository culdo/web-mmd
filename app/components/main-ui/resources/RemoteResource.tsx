import { MouseEvent, useContext, useEffect, useRef, useState } from "react";
import ResourceCard from "../resources/ResourceCard";
import { SenderContext } from "../../multiplayer/fileTransfer";
import useGlobalStore from "@/app/stores/useGlobalStore";
import useFileTransfer from "../../multiplayer/fileTransfer/useFileTransfer";
import { useResource } from "../context";

function RemoteResource({ name, autoRequest = false }: { name: string; autoRequest?: boolean }) {
    const { type, onLoad } = useResource()
    const sender = useContext(SenderContext)
    const fullname = `${name}@${sender}`
    const uriPrefix = `${type}/${name}`
    const { channel, synced } = useFileTransfer(uriPrefix)
    const onClick = (e: MouseEvent) => {
        channel.send({
            uri: `${uriPrefix}/requestResource`
        })
    }
    const receiveBufferRef = useRef<string[]>([])
    const receiveBufferSizeRef = useRef<number>(0)
    const resourceSizeRef = useRef<number>(null)
    const [previewImgSrc, setPreviewImgSrc] = useState<string>()
    const autoRequestResources = useGlobalStore(state => state.autoRequestResources)

    useEffect(() => {
        if (!synced) return
        if (autoRequest) {
            channel.send({
                uri: `${uriPrefix}/requestResource`
            })
            return
        }
        channel.send({
            uri: `${uriPrefix}/requestPreviewImg`
        })
    }, [synced])

    useEffect(() => {
        const onMessage = (e: MessageEvent<DataSchema>) => {
            const { uri, payload } = e.data
            if (!uri.startsWith(uriPrefix)) return
            const pathname = uri.split(uriPrefix + "/")[1]
            if (pathname == "previewImg") {
                setPreviewImgSrc(payload)
            }
            if (pathname == "resourceSize") {
                useGlobalStore.setState({ storeReady: false })
                resourceSizeRef.current = payload
                receiveBufferRef.current = []
            }
            if (pathname == "resourceData") {
                receiveBufferRef.current.push(payload);
                const loading = document.getElementById("loading")
                if (loading) {
                    loading.textContent = "Loading " + Math.round(receiveBufferSizeRef.current * 100 / resourceSizeRef.current) + "%..."
                }
                receiveBufferSizeRef.current += payload.length
                if (receiveBufferSizeRef.current == resourceSizeRef.current) {
                    onLoad(fullname, receiveBufferRef.current.join(""), channel)
                    if (type !== "Presets") {
                        if (autoRequest) {
                            useGlobalStore.setState(({ autoRequestResources }) => {
                                autoRequestResources[type][name] = true
                                return { autoRequestResources: { ...autoRequestResources } }
                            })
                        }
                        useGlobalStore.setState({ openMainUI: false })
                    }
                }
            }
        }
        channel.addEventListener("message", onMessage)
        return () => channel.removeEventListener("message", onMessage)
    }, [])

    if (autoRequest) return <></>
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