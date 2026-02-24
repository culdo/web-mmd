import useGlobalStore from "@/app/stores/useGlobalStore";
import { createContext } from "react";
import { resourcesMap } from "../../main-ui/context";
import ResourcesListener from "./ResourcesListener";
import { ResourceTypeContext } from "../../main-ui/context";

export const SenderContext = createContext("")

function FileTransfer() {
    const peerChannels = useGlobalStore(state => state.peerChannels)

    return (
        <>
            {
                Object.keys(resourcesMap).map(type =>
                    <ResourceTypeContext.Provider key={type} value={type}>
                        {
                            Object.entries(peerChannels)
                                .filter(([_, pc]) => pc.channels["fileTransfer"])
                                .map(([sender, _]) =>
                                    <SenderContext.Provider key={sender} value={sender}>
                                        <ResourcesListener />
                                    </SenderContext.Provider>
                                )
                        }
                    </ResourceTypeContext.Provider>
                )
            }
        </>
    );
}

export default FileTransfer;