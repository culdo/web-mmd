import { createContext, useEffect } from "react";
import useGlobalStore from "@/app/stores/useGlobalStore";

export const PeerContext = createContext<{
    peerId: string
}>(null)

function PeerConnection({ id, children }: { id: string, children: React.ReactNode }) {
    const peerChannel = useGlobalStore(state => state.peerChannels)[id]

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