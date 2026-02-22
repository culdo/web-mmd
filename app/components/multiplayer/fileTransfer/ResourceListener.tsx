import useConfigStore from "@/app/stores/useConfigStore";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { useContext, useEffect } from "react";
import { SenderContext } from "./Peer";
import JSONDataChannel from "../peer/channel/JSONDataChannel";
import useSynced from "../peer/channel/useSynced";

function ResourceListener({ type, name, onRequest }: { type: ResourceType, name: string, onRequest: (name: string) => Promise<string> }) {
    const sender = useContext(SenderContext)
    const channel = useGlobalStore(state => state.peerChannels)[sender]?.channels["fileTransfer"] as JSONDataChannel
    const screenShot = useConfigStore(state => state.presetsInfo)[name]?.screenShot
    const uriPrefix = `${type}/${name}`

    const synced = useSynced(channel, uriPrefix)
    useEffect(() => {
        const onMessage = async (e: MessageEvent<DataSchema>) => {
            const { uri, payload } = e.data
            if (uri == `${uriPrefix}/requestResource`) {
                const data = await onRequest(name)
                channel.send({
                    uri: `${uriPrefix}/resourceSize`,
                    payload: data.length
                })
                const chunkSize = 16384;
                const readSlice = (offset: number) => {
                    const slice = data.slice(offset, offset + chunkSize);
                    channel.send({
                        uri: `${uriPrefix}/resourceData`,
                        payload: slice
                    })
                    offset += slice.length;
                    if (offset < data.length) {
                        readSlice(offset);
                    }
                };
                readSlice(0);
            }
        }
        channel.addEventListener("message", onMessage)
        return () => {
            channel.removeEventListener("message", onMessage)
        }
    }, [])

    useEffect(() => {
        if (!synced || !screenShot) return
        channel.send({
            uri: `${uriPrefix}/previewImg`,
            payload: screenShot
        })
    }, [synced, screenShot])

    return (
        <></>
    );
}

export default ResourceListener;