import { createContext, useEffect } from "react";
import useGlobalStore from "@/app/stores/useGlobalStore";
import useConfigStore from "@/app/stores/useConfigStore";

export const BroadcastContext = createContext<{
    channel: OneToManyChannel
}>(null)

function BroadcastChannel({ label }: { label: string }) {
    const peerChannels = useGlobalStore(state => state.peerChannels)
    const broadcastChannels = useGlobalStore(state => state.broadcastChannels)
    const broadcastChannel = broadcastChannels[label]
    const uid = useConfigStore(state => state.uid);

    // set up broadcast channel
    useEffect(() => {
        useGlobalStore.setState(({ broadcastChannels }) => {
            broadcastChannels[label] = {
                onMessage: () => { },
                send: (data: any) => {
                    for (const p of Object.values(peerChannels)) {
                        p.channels[label]?.send(JSON.stringify({
                            sender: uid,
                            data
                        }))
                    }
                }
            }
            return { broadcastChannels: { ...broadcastChannels } }
        })
    }, [peerChannels])

    // set up onMessage of broadcast channel
    useEffect(() => {
        if (!broadcastChannel?.onMessage) return
        const onMessage = (ev: MessageEvent) => {
            const data = JSON.parse(ev.data)
            broadcastChannel.onMessage(data)
        }
        for (const p of Object.values(peerChannels)) {
            p.channels[label]?.addEventListener("message", onMessage)
        }
        return () => {
            for (const p of Object.values(peerChannels)) {
                p.channels[label]?.removeEventListener("message", onMessage)
            }
        }
    }, [broadcastChannel?.onMessage, peerChannels])

    // clean up
    useEffect(() => {
        return () => {
            useGlobalStore.setState(({ broadcastChannels }) => {
                delete broadcastChannels[label]
                return { broadcastChannels: { ...broadcastChannels } }
            })
        }
    }, [])
    return <></>;
}

export default BroadcastChannel;