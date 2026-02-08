import { createContext, useContext, useEffect } from "react";
import Actions from "./Actions";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { SkinnedMesh } from "three";

export const RemoteModelContext = createContext<{
    channel: RTCDataChannel
    mesh: SkinnedMesh
}>(null)

function RemoteModel() {
    const { mesh, channel } = useContext(RemoteModelContext)

    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            const { type, payload } = JSON.parse(event.data) as EventData
            if (type == "pose") {
                if (mesh.matrixWorldAutoUpdate) {
                    mesh.matrixWorldAutoUpdate = false
                }
                mesh.matrixWorld.fromArray(payload);
            }
        }
        channel.addEventListener("message", onMessage)
        return () => channel.removeEventListener("message", onMessage)
    }, [channel, mesh])
    return (
        <>
            <Actions></Actions>
        </>
    );
}

function Wrapper({ sender }: { sender: string }) {
    const mesh = useGlobalStore(state => state.models)[sender]
    const channel = useGlobalStore(state => state.peerChannels)[sender]?.channels["model"]
    if (!mesh || !channel) return null
    return (
        <RemoteModelContext.Provider value={{ channel, mesh }}>
            <RemoteModel></RemoteModel>
        </RemoteModelContext.Provider>
    );
}

export default Wrapper;