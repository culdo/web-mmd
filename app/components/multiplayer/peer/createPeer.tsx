import { enqueueSnackbar } from "notistack";
import { infoStyle } from "@/app/utils/gui";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { isDev } from "@/app/utils/base";

function createPeer(uid: string, setSDP: (sdp: RTCSessionDescriptionInit) => void, onOpen: (dataChannel: RTCDataChannel) => void = null) {
    const peerConnection = new RTCPeerConnection({
        iceServers: [{
            urls: "stun:stun2.l.google.com:19302"
        }]
    });

    peerConnection.onconnectionstatechange = (event) => {
        switch (peerConnection.connectionState) {
            case "new":
            case "connecting":
                break;
            case "connected":
                break;
            case "disconnected":
            case "closed":
            case "failed":
            default:
                clearUp()
        }
    }


    peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate?.type === "srflx" || event.candidate === null) {
            console.log(`${peerConnection.localDescription.type} to ${uid}`)
            console.log(peerConnection.localDescription)
            setSDP(peerConnection.localDescription.toJSON());
            peerConnection.onicecandidate = null;
        }
    };
    const signalChannel = peerConnection.createDataChannel("signal", { negotiated: true, id: 0 })
    signalChannel.onopen = () => {
        useGlobalStore.setState(({ peerChannels }) => {
            peerChannels[uid] = {
                connection: peerConnection,
                channels: { [signalChannel.label]: signalChannel }
            };
            return {
                peerChannels: { ...peerChannels }
            }
        })
        onOpen?.(signalChannel)
        if (isDev) {
            enqueueSnackbar(`Connected with ${uid}!`, infoStyle(true));
        }
    }

    signalChannel.onclose = () => {
        clearUp()
    }

    function clearUp() {
        useGlobalStore.setState(({ peerChannels }) => {
            if (!(uid in peerChannels)) return {}
            delete peerChannels[uid];
            if (isDev) {
                enqueueSnackbar(`Disconnected with ${uid}!`, infoStyle(false));
            }
            return {
                peerChannels: { ...peerChannels }
            }
        })
    }

    return peerConnection;
}

function checkPeer(uid: string) {
    const peerConnection = useGlobalStore.getState().peerChannels[uid]?.connection;
    if (peerConnection) {
        return peerConnection
    }
}

export { checkPeer };

export default createPeer;