import { useEffect } from "react";
import createPeer from "./createPeer";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { setUser } from "@/app/modules/firebase/init";

function useAnswerRTC() {
    const onAnsweringRef = useGlobalStore(state => state.onAnsweringRef);

    useEffect(() => {
        onAnsweringRef.current = async (data: any) => {
            if (data.sdp?.type == 'offer') {
                const peerConnection = createPeer(data.offerId);
                // take offer
                await peerConnection.setRemoteDescription(data.sdp);
                // start answering
                peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
                    if (event.candidate?.type === "srflx" || event.candidate === null) {
                        setUser(data.offerId, peerConnection.localDescription.toJSON());
                        peerConnection.onicecandidate = null;
                    }
                };
                await peerConnection.setLocalDescription();
            };
        }
    }, []);

}

export default useAnswerRTC;