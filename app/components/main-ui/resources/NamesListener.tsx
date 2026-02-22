import { useContext, useEffect } from "react";
import { SenderContext } from "../../multiplayer/fileTransfer/Peer";
import useGlobalStore from "@/app/stores/useGlobalStore";
import JSONDataChannel from "../../multiplayer/peer/channel/JSONDataChannel";
import useSynced from "../../multiplayer/peer/channel/useSynced";

function NamesListener({ type, names }: { type: string, names: string[] }) {
    const sender = useContext(SenderContext)
    const channel = useGlobalStore(state => state.peerChannels)[sender]?.channels["fileTransfer"] as JSONDataChannel

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