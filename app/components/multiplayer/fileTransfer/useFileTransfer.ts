import useGlobalStore from "@/app/stores/useGlobalStore";
import { useContext } from "react";
import { SenderContext } from ".";
import JSONDataChannel from "../peer/channel/JSONDataChannel";

function useFileTransfer() {
    const sender = useContext(SenderContext)
    const channel = useGlobalStore(state => state.peerChannels)[sender]?.channels["fileTransfer"] as JSONDataChannel
    return channel
}

export default useFileTransfer;