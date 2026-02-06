import useGlobalStore from "@/app/stores/useGlobalStore";
import createPeer, { checkPeer } from "./createPeer";
import { setSDP, setUser } from "@/app/modules/firebase/init";
import useConfigStore from "@/app/stores/useConfigStore";
import { useCallback } from "react";

function useOfferRTC() {
    const uid = useConfigStore(state => state.uid);
    const onOfferingRef = useGlobalStore(state => state.onOfferingRef)

    const connect = useCallback(async (targetUid: string, initCode = "") => {
        if (checkPeer(targetUid)) return;
        const setOfferSDP = (sdp: RTCSessionDescriptionInit) => {
            setSDP([targetUid, uid], sdp);
        };
        const peerConnection = createPeer(targetUid, setOfferSDP, (dc) => {
            if (initCode) dc.send(initCode)
        });
        // listen for answer
        const connectionId = [targetUid, uid].sort().join("_")
        onOfferingRef.current[connectionId] = async (data: ConnectionInfo) => {
            if (data?.sdp?.type == 'answer') {
                console.log(`Answer from ${targetUid}`)
                console.log(data.sdp)
                await peerConnection.setRemoteDescription(data.sdp);
                delete onOfferingRef.current[connectionId]
            };
        }
        // start offering
        await peerConnection.setLocalDescription();
        return peerConnection;
    }, [])

    return connect;
}

export default useOfferRTC;