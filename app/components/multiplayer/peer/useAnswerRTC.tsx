import { useEffect } from "react";
import createPeer, { checkPeer } from "./createPeer";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { setSDP } from "@/app/modules/firebase/init";
import useConfigStore from "@/app/stores/useConfigStore";

function useAnswerRTC() {
    const onInitRef = useGlobalStore(state => state.onInitRef)
    const onAnsweringRef = useGlobalStore(state => state.onAnsweringRef)
    const uid = useConfigStore(state => state.uid);

    useEffect(() => {
        onAnsweringRef.current = async (data: ConnectionInfo) => {
            if (data?.sdp?.type == 'offer') {
                const offerId = data.peerA == uid ? data.peerB : data.peerA
                if (checkPeer(offerId)) return;
                const setAnswerSDP = (sdp: RTCSessionDescriptionInit) => {
                    setSDP([offerId, uid], sdp);
                };
                const peerConnection = createPeer(offerId, setAnswerSDP, (dc) => {
                    dc.onmessage = (e) => {
                        onInitRef.current?.(e.data, offerId)
                    }
                });
                // take offer
                console.log(`Offer from ${offerId}`)
                console.log(data.sdp)
                await peerConnection.setRemoteDescription(data.sdp);
                // start answering
                await peerConnection.setLocalDescription();
            };
        }
        return () => {
            onAnsweringRef.current = null
        }
    }, []);
}

export default useAnswerRTC;