import { useEffect } from "react";
import useSynced from "../peer/channel/useSynced";
import useFileTransfer from "./useFileTransfer";

function NamesListener({ type, names }: { type: string, names: string[] }) {
    const channel = useFileTransfer()

    useSynced(channel, type)
    useEffect(() => {
        const onMessage = (e: MessageEvent<DataSchema>) => {
            const { uri } = e.data
            if (uri == `${type}/requestResourceNames`) {
                channel.send({
                    uri: `${type}/resourceNames`,
                    payload: names
                })
            }
        }
        channel.addEventListener("message", onMessage)
        return () => channel.removeEventListener("message", onMessage)
    }, [])

    return <></>
}


export default NamesListener;