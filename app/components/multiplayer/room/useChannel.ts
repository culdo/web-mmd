import useGlobalStore from "@/app/stores/useGlobalStore";
import { useEffect, useState } from "react";

function useChannel(label: string, id: number, peerIdOrCode: string) {
    const peerChannel = useGlobalStore(state => state.peerChannels)[peerIdOrCode]
    const onInitRef = useGlobalStore(state => state.onInitRef)

    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection>()
    useEffect(() => {
        if (peerChannel) {
            setPeerConnection(peerChannel?.connection);
        } else {
            onInitRef.current = (data, peer) => {
                if (peerIdOrCode == data) {
                    setPeerConnection(peer);
                    onInitRef.current = null;
                }
            }
        }
    }, [peerChannel])

    const [dataChannel, setDataChannel] = useState<RTCDataChannel>()
    useEffect(() => {
        if (!peerConnection) return
        const newDataChannel = peerConnection.createDataChannel(label, { negotiated: true, id });
        newDataChannel.onopen = () => {
            setDataChannel(newDataChannel)
        };
        newDataChannel.onclose = () => {
            setDataChannel(null)
        };
    }, [peerConnection])

    useEffect(() => {
        if (dataChannel) {
            return () => dataChannel.close()
        }
    }, [dataChannel])

    return dataChannel;
}

export default useChannel;