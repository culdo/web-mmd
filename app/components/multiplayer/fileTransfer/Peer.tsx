import { createContext, useEffect } from "react";
import useGlobalStore from "@/app/stores/useGlobalStore";
import LocalResources from "./local";

export const SenderContext = createContext("")

function Peer({ sender }: { sender: string }) {
    const channel = useGlobalStore(state => state.peerChannels)[sender]?.channels["fileTansfer"]
    if (!channel) return null
    return (
        <SenderContext.Provider value={sender}>
            <LocalResources></LocalResources>
        </SenderContext.Provider>
    );
}

export default Peer;