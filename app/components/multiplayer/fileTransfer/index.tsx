import useGlobalStore from "@/app/stores/useGlobalStore";
import Peer from "./Peer";

function FileTransfer() {
    const peerChannels = useGlobalStore(state => state.peerChannels)

    return (
        <>
            {
                Object.entries(peerChannels)
                    .filter(([_, pc]) => pc.channels["fileTransfer"])
                    .map(([sender, pc]) => <Peer key={sender} sender={sender}></Peer>)
            }
        </>
    );
}

export default FileTransfer;