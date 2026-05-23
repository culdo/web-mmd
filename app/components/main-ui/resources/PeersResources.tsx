import useGlobalStore from "@/app/stores/useGlobalStore";
import RemoteResources from "./RemoteResources";
import { SenderContext } from "../../multiplayer/fileTransfer";
import { autoRequestResourcesMap, useResource } from "../context";
import useAutoRequestResources from "./useAutoRequestResources";

function PeersResources() {
    const peerChannels = useGlobalStore(state => state.peerChannels)
    const autoRequestResources = useAutoRequestResources()
    const { type } = useResource()
    return (
        <>
            {
                Object.entries(peerChannels)
                    .filter(([_, pc]) => pc.channels["fileTransfer"])
                    .map(([sender, _]) => (
                        <SenderContext.Provider key={sender} value={sender}>
                            <RemoteResources type={type} />
                            {
                                type === "Presets" && autoRequestResources && Object.keys(autoRequestResourcesMap).map(type =>
                                    <RemoteResources key={type} type={type} autoRequestNames={Object.keys(autoRequestResources[type])} />
                                )
                            }
                        </SenderContext.Provider>
                    ))
            }
        </>
    );
}

export default PeersResources;