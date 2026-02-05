import useGlobalStore from "@/app/stores/useGlobalStore";
import createPeer, { checkPeer } from "./createPeer";
import { setUser } from "@/app/modules/firebase/init";
import useConfigStore from "@/app/stores/useConfigStore";
import { createRef, useCallback } from "react";

function useOfferRTC(targetUid: string, initCode = "") {
    const uid = useConfigStore(state => state.uid);
    const onOfferingRef = useGlobalStore(state => state.onOfferingRef)

    const connect = useCallback(() => new Promise<RTCPeerConnection>((resolve) => async () => {
        if (checkPeer(targetUid)) return;
        const onicecandidate = (sdp: RTCSessionDescriptionInit) => {
            setUser(targetUid, sdp, uid);
        };
        const peerConnection = createPeer(targetUid, onicecandidate, (dc) => {
            resolve(peerConnection)
            if (initCode) dc.send(initCode)
        });
        // listen for answer
        onOfferingRef.current = async (data: any) => {
            if (data?.sdp?.type == 'answer') {
                console.log(data.sdp)
                await peerConnection.setRemoteDescription(data.sdp);
                onOfferingRef.current = null;
            };
        }
        // start offering
        await peerConnection.setLocalDescription();
        return peerConnection;
    }), [targetUid])

    return connect;
}

export default useOfferRTC;