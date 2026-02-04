import { useEffect } from "react";
import createPeer, { checkPeer } from "./createPeer";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { setUser } from "@/app/modules/firebase/init";

function useAnswerRTC() {
    const onInitRef = useGlobalStore(state => state.onInitRef)
    const onAnsweringRef = useGlobalStore(state => state.onAnsweringRef)
    useEffect(() => {
        onAnsweringRef.current = async (data: UserInfo) => {
            if (data?.sdp?.type == 'offer') {
                if (checkPeer(data.offerId)) return;
                const onicecandidate = (sdp: RTCSessionDescriptionInit) => {
                    setUser(data.offerId, sdp);
                };
                const peerConnection = createPeer(data.offerId, onicecandidate, (dc) => {
                    dc.onmessage = (e) => {
                        onInitRef.current?.(e.data, peerConnection)
                    }
                });
                // take offer
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