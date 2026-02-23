import useGlobalStore from "@/app/stores/useGlobalStore";
import RemoteResources from "./RemoteResources";
import { SenderContext } from "../../multiplayer/fileTransfer";

function PeersResources() {
    const peerChannels = useGlobalStore(state => state.peerChannels)
    return (
        <>
            {
                Object.entries(peerChannels)
                    .filter(([_, pc]) => pc.channels["fileTransfer"])
                    .map(([sender, _]) => (
                        <SenderContext.Provider key={sender} value={sender}>
                            <RemoteResources />
                        </SenderContext.Provider>
                    ))
            }
        </>
    );
}

export default PeersResources;