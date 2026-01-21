import useGlobalStore from "@/app/stores/useGlobalStore";
import createPeer from "./createPeer";
import { setUser } from "@/app/modules/firebase/init";
import useConfigStore from "@/app/stores/useConfigStore";

function useOfferRTC() {
    const onOfferingRef = useGlobalStore(state => state.onOfferingRef);
    const uid = useConfigStore(state => state.uid);

    const buildConnect = (targetUid: string) => {
        return async () => {
            const peerConnection = createPeer(targetUid);
            // listen for answer
            onOfferingRef.current = async (data: any) => {
                if (data.sdp?.type == 'answer') {
                    console.log(data.sdp)
                    await peerConnection.setRemoteDescription(data.sdp);
                    onOfferingRef.current = null;
                };
            }
            // start offering
            peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
                if (event.candidate?.type === "srflx" || event.candidate === null) {
                    setUser(targetUid, peerConnection.localDescription.toJSON(), uid);
                    peerConnection.onicecandidate = null;
                }
            };
            await peerConnection.setLocalDescription();
        }
    }


    return buildConnect;
}

export default useOfferRTC;