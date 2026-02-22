import useConfigStore from "@/app/stores/useConfigStore";
import { useEffect } from "react";
import useSynced from "../peer/channel/useSynced";
import useFileTransfer from "./useFileTransfer";

function ResourceListener({ type, name, onRequest }: { type: ResourceType, name: string, onRequest: (name: string) => Promise<string> }) {
    const channel = useFileTransfer()
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
                    if(channel.bufferedAmount > 1024 * 1024) {
                        setTimeout(() => readSlice(offset), 100)
                        return
                    }
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