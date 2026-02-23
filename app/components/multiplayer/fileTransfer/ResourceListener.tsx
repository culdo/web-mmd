import useConfigStore from "@/app/stores/useConfigStore";
import { useEffect } from "react";
import useFileTransfer from "./useFileTransfer";

function ResourceListener({ type, name, onRequest }: { type: ResourceType, name: string, onRequest: (name: string) => Promise<string> }) {
    const screenShot = useConfigStore(state => state.presetsInfo)[name]?.screenShot
    const uriPrefix = `${type}/${name}`
    const { channel } = useFileTransfer(uriPrefix)

    useEffect(() => {
        const onMessage = async (e: MessageEvent<DataSchema>) => {
            const { uri } = e.data
            if (uri == `${uriPrefix}/requestResource`) {
                const data = await onRequest(name)
                channel.send({
                    uri: `${uriPrefix}/resourceSize`,
                    payload: data.length
                })
                const chunkSize = 16384;
                const readSlice = (offset: number) => {
                    if (channel.bufferedAmount > 1024 * 1024) {
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
        if (!screenShot) return
        const onMessage = async (e: MessageEvent<DataSchema>) => {
            const { uri } = e.data
            if (uri == `${uriPrefix}/requestPreviewImg`) {
                channel.send({
                    uri: `${uriPrefix}/previewImg`,
                    payload: screenShot
                })
            }
        }
        channel.addEventListener("message", onMessage)
        return () => {
            channel.removeEventListener("message", onMessage)
        }
    }, [screenShot])

    return (
        <></>
    );
}

export default ResourceListener;