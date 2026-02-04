import { enqueueSnackbar } from "notistack";
import PeerConnection from "./PeerConnection";
import { infoStyle } from "@/app/utils/gui";
import useGlobalStore from "@/app/stores/useGlobalStore";

function createPeer(uid: string, onicecandidate: (sdp: RTCSessionDescriptionInit) => void, onOpen: (dataChannel: RTCDataChannel) => void = null) {
    const peerConnection = new RTCPeerConnection({
        iceServers: [{
            urls: "stun:stun2.l.google.com:19302"
        }]
    });
    peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate?.type === "srflx" || event.candidate === null) {
            console.log(peerConnection.localDescription)
            onicecandidate(peerConnection.localDescription.toJSON());
            peerConnection.onicecandidate = null;
        }
    };
    const initChannel = peerConnection.createDataChannel("init", { negotiated: true, id: 0 })
    initChannel.onopen = () => {
        useGlobalStore.setState(({ peers, peerChannels }) => {
            peers[uid] = <PeerConnection key={uid} targetUid={uid} initChannel={initChannel} reset={reset} />;
            peerChannels[uid] = {
                connection: peerConnection,
                channels: { [initChannel.label]: initChannel }
            };
            return {
                peers: { ...peers },
                peerChannels: { ...peerChannels }
            }
        })
        onOpen?.(initChannel)
        enqueueSnackbar(`Connected with ${uid}!`, infoStyle(true));
    }
    initChannel.onclose = () => {
        useGlobalStore.setState(({ peers, peerChannels }) => {
            peers[uid] = <PeerConnection key={uid} targetUid={uid} />;
            delete peerChannels[uid];
            return {
                peers: { ...peers },
                peerChannels: { ...peerChannels }
            }
        })
        enqueueSnackbar(`Disconnected with ${uid}!`, infoStyle(false));
    }

    function reset() {
        peerConnection.close();
        initChannel.close();
    }

    return peerConnection;
}

function checkPeer(uid: string) {
    const peerConnection = useGlobalStore.getState().peerChannels[uid];
    if (peerConnection) {
        return peerConnection
    }
}

export { checkPeer };

export default createPeer;