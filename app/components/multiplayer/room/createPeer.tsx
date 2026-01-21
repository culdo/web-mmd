import { setUser } from "@/app/modules/firebase/init";
import { enqueueSnackbar } from "notistack";
import PeerConnection from "./PeerConnection";
import { infoStyle } from "@/app/utils/gui";
import useGlobalStore from "@/app/stores/useGlobalStore";

function createPeer(uid: string) {
    const peerConnection = new RTCPeerConnection({
        iceServers: [{
            urls: "stun:stun2.l.google.com:19302"
        }]
    });
    const dataChannel = peerConnection.createDataChannel('chat', { negotiated: true, id: 999 });
    dataChannel.onopen = () => {
        useGlobalStore.setState(({ peers }) => {
            peers[uid] = <PeerConnection key={uid} targetUid={uid} dataChannel={dataChannel} reset={reset} />;
            return { peers: { ...peers } }
        })
        enqueueSnackbar(`Connected with ${uid}!`, infoStyle(true));
    };
    dataChannel.onclose = () => {
        useGlobalStore.setState(({ peers }) => {
            peers[uid] = <PeerConnection key={uid} targetUid={uid} />;
            return { peers: { ...peers } }
        })
        enqueueSnackbar(`Disconnected with ${uid}!`, infoStyle(false));
    };

    function reset() {
        if (dataChannel) {
            dataChannel.close();
        }
        if (peerConnection) {
            peerConnection.close();
        }
    }

    return peerConnection;
}

export default createPeer;