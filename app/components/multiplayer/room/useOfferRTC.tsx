import useGlobalStore from "@/app/stores/useGlobalStore";
import createPeer, { checkPeer } from "./createPeer";
import { setUser } from "@/app/modules/firebase/init";
import useConfigStore from "@/app/stores/useConfigStore";

function useOfferRTC(initCode = "") {
    const uid = useConfigStore(state => state.uid);
    const onOfferingRef = useGlobalStore(state => state.onOfferingRef)
    
    const buildConnect = (targetUid: string) => {
        return async () => {
            if (checkPeer(targetUid)) return;
            const onicecandidate = (sdp: RTCSessionDescriptionInit) => {
                setUser(targetUid, sdp, uid);
            };
            const peerConnection = createPeer(targetUid, onicecandidate, (dc) => {
                if (initCode) dc.send(initCode)
            });
            // listen for answer
            onOfferingRef.current = async (data: any) => {
                if (data?.sdp?.type == 'answer') {
                    console.log(data.sdp)
                    await peerConnection.setRemoteDescription(data.sdp);
                    useGlobalStore.setState({ onOfferingRef: null });
                };
            }
            // start offering
            await peerConnection.setLocalDescription();
        }
    }


    return buildConnect;
}

export default useOfferRTC;