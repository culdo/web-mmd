import useConfigStore from "@/app/stores/useConfigStore";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { useContext, useEffect } from "react";
import { SenderContext } from "../Peer";
import JSONDataChannel from "../../peer/channel/JSONDataChannel";
import useSynced from "../../peer/channel/useSynced";

function Resource({ type, name, onRequest }: { type: string, name: string, onRequest: (name: string) => Promise<string> }) {
    const sender = useContext(SenderContext)
    const channel = useGlobalStore(state => state.peerChannels)[sender]?.channels["fileTransfer"] as JSONDataChannel
    const getScreenShot = useGlobalStore(state => state.getScreenShot)

    const synced = useSynced(channel)
    useEffect(() => {
        if (!synced) return
        channel.send({
            type: `${type}/resourceName`,
            payload: `${name}`
        })
        channel.send({
            type: `${type}/${name}/previewImg`,
            payload: getScreenShot(200, 100)
        })
        const onMessage = async (e: MessageEvent) => {
            const { type, payload } = e.data
            if (type == `${type}/${name}/requestResource`) {
                const data = await onRequest(name)
                channel.send({
                    type: `${type}/${name}/resourceSize`,
                    payload: data.length
                })
                const chunkSize = 16384;
                const readSlice = (offset: number) => {
                    const slice = data.slice(offset, offset + chunkSize);
                    channel.send({
                        type: `${type}/${name}/resourceData`,
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
    }, [synced])

    return (
        <>
            { }
        </>
    );
}

export default Resource;