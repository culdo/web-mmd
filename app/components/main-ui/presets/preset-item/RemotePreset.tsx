import useConfigStore, { addPreset } from "@/app/stores/useConfigStore";
import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore, { migratePreset, setPreset } from "@/app/stores/usePresetStore";
import { MouseEvent, useEffect, useRef, useState } from "react";
import PresetCard from "./PresetCard";
import useSynced from "../../../multiplayer/peer/channel/useSynced";
import JSONDataChannel from "../../../multiplayer/peer/channel/JSONDataChannel";

function RemotePreset({ channel }: { channel: JSONDataChannel }) {
    const getScreenShot = useGlobalStore(state => state.getScreenShot)
    const onClick = (e: MouseEvent) => {
        const preset = usePresetStore.getState()
        const presetJson = JSON.stringify(preset)
        channel.send({
            type: "presetSize",
            payload: presetJson.length
        })
        const chunkSize = 16384;
        const readSlice = (offset: number) => {
            const slice = presetJson.slice(offset, offset + chunkSize);
            channel.send({
                type: "presetData",
                payload: slice
            })
            offset += slice.length;
            if (offset < presetJson.length) {
                readSlice(offset);
            }
        };
        readSlice(0);
    }
    const previewIntervalRef = useRef<NodeJS.Timeout>()
    const receiveBufferRef = useRef<string[]>()
    const receiveBufferSizeRef = useRef<number>()
    const presetSizeRef = useRef<number>()
    const [presetName, setPresetName] = useState<string>()
    const [previewImgSrc, setPreviewImgSrc] = useState<string>()
    const uid = useConfigStore(state => state.uid)
    const preset = useConfigStore(state => state.preset)

    const synced = useSynced(channel)
    useEffect(() => {
        if (!synced) return
        channel.send({
            type: "presetName",
            payload: `${preset}@${uid}`
        })
        channel.send({
            type: "previewImg",
            payload: getScreenShot(200, 100)
        })
    }, [synced])

    useEffect(() => {
        const loading = document.getElementById("loading")
        const onMessage = (e: MessageEvent) => {
            const { type, payload } = e.data    
            if (type == "previewImg") {
                setPreviewImgSrc(payload)
            }
            if (type == "presetName") {
                setPresetName(payload)
            }
            if (type == "presetSize") {
                presetSizeRef.current = payload
                useGlobalStore.setState({ presetReady: false })
            }
            if (type == "presetData") {
                receiveBufferRef.current.push(payload);
                if (loading) {
                    loading.textContent = "Loading " + Math.round(receiveBufferSizeRef.current * 100 / presetSizeRef.current) + "%..."
                }
                receiveBufferSizeRef.current += payload.length
                if (receiveBufferSizeRef.current == presetSizeRef.current) {
                    addPreset(presetName)
                    setPreset(presetName)
                    const loadedPreset = JSON.parse(receiveBufferRef.current.join())
                    const { version } = usePresetStore.getState()
                    if (version != loadedPreset.version) {
                        migratePreset(loadedPreset, loadedPreset.version)
                    } else {
                        usePresetStore.setState(loadedPreset)
                    }
                    useGlobalStore.setState({ presetReady: true })
                }
            }
        }
        channel.addEventListener("message", onMessage)
        return () => channel.removeEventListener("message", onMessage)
    }, [])

    return (
        <PresetCard
            presetName={presetName}
            previewImgSrc={previewImgSrc}
            onClick={onClick}
        >
        </PresetCard>
    );
}

export default RemotePreset;