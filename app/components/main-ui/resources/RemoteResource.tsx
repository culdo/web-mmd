import useConfigStore, { addPreset } from "@/app/stores/useConfigStore";
import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore, { migratePreset, setPreset } from "@/app/stores/usePresetStore";
import { MouseEvent, useEffect, useRef, useState } from "react";
import JSONDataChannel from "../../multiplayer/peer/channel/JSONDataChannel";
import ResourceCard from "../resources/ResourceCard";

function RemoteResource({ type, name, channel, onLoad }: { type: string, name: string, channel: JSONDataChannel, onLoad: (name: string, data: string) => void }) {
    const onClick = (e: MouseEvent) => {
        channel.send({
            type: `${type}/${name}/requestResource`,
            payload: null
        })
    }
    const receiveBufferRef = useRef<string[]>()
    const receiveBufferSizeRef = useRef<number>()
    const resourceSizeRef = useRef<number>()
    const [resourceName, setResourceName] = useState<string>()
    const [previewImgSrc, setPreviewImgSrc] = useState<string>()
    const uid = useConfigStore(state => state.uid)

    useEffect(() => {
        const loading = document.getElementById("loading")
        const onMessage = (e: MessageEvent) => {
            const { type, payload } = e.data
            if (type == "previewImg") {
                setPreviewImgSrc(payload)
            }
            if (type == "resourceName") {
                setResourceName(payload)
            }
            if (type == "resourceSize") {
                resourceSizeRef.current = payload
            }
            if (type == "resourceData") {
                receiveBufferRef.current.push(payload);
                if (loading) {
                    loading.textContent = "Loading " + Math.round(receiveBufferSizeRef.current * 100 / resourceSizeRef.current) + "%..."
                }
                receiveBufferSizeRef.current += payload.length
                if (receiveBufferSizeRef.current == resourceSizeRef.current) {
                    onLoad(resourceName, receiveBufferRef.current.join())
                }
            }
        }
        channel.addEventListener("message", onMessage)
        return () => channel.removeEventListener("message", onMessage)
    }, [])

    return (
        <ResourceCard
            name={resourceName}
            previewImgSrc={previewImgSrc}
            onClick={onClick}
        >
        </ResourceCard>
    );
}

export default RemoteResource;