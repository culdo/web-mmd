import { createContext, useEffect } from "react";
import useOfferRTC from "./useOfferRTC";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { enqueueSnackbar } from "notistack";
import { infoStyle } from "@/app/utils/gui";

export const PeerContext = createContext<{
    peerId: string
}>(null)

function PeerConnection({ id, children }: { id: string, children: React.ReactNode }) {
    const connect = useOfferRTC(id)
    const peerChannel = useGlobalStore(state => state.peerChannels)[id]

    // auto connect on first time
    useEffect(() => {
        if (peerChannel?.connection) return
        connect()
    }, [])

    useEffect(() => {
        if (!peerChannel?.connection) return
        return () => {
            peerChannel.connection.close()
        }
    }, [peerChannel?.connection])

    return <PeerContext.Provider value={{ peerId: id }}>
        {children}
    </PeerContext.Provider>
}

export default PeerConnection;