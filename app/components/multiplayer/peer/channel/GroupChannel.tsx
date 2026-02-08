import { createContext, useEffect } from "react";
import useGlobalStore from "@/app/stores/useGlobalStore";
import Channel from ".";

export const GroupChannelContext = createContext<GroupChannel>(null)

function GroupChannel({ label, id, peerIds = [], broadcast = true, children }: { label: string, id: number, peerIds?: string[], broadcast?: boolean, children?: React.ReactNode }) {
    const peerChannels = useGlobalStore(state => state.peerChannels)
    const groupChannels = useGlobalStore(state => state.groupChannels)
    const groupChannel = groupChannels[label]

    // set up group channel
    useEffect(() => {
        useGlobalStore.setState(({ groupChannels }) => {
            groupChannels[label] = {
                createPeerChannel: (peerId) => {
                    if (broadcast || peerIds.includes(peerId)) {
                        return <Channel key={id} label={label} id={id}></Channel>
                    } else {
                        return null
                    }
                },
                onOpen: () => { },
                onClose: () => { },
                onMessage: () => { },
                send: () => { }
            }
            return { groupChannels: { ...groupChannels } }
        })
        return () => {
            useGlobalStore.setState(({ groupChannels }) => {
                delete groupChannels[label]
                return { groupChannels: { ...groupChannels } }
            })
        }
    }, [])

    // set up send of group channel
    useEffect(() => {
        if (!groupChannel) return
        groupChannel.send = (data: any) => {
            for (const p of Object.values(peerChannels)) {
                if (p.channels[label]?.readyState == "open") {
                    p.channels[label]?.send(JSON.stringify(data))
                }
            }
        }
    }, [peerChannels, groupChannel])

    // set up onMessage of group channel
    useEffect(() => {
        if (!groupChannel?.onMessage) return
        const buildOnMessage = (sender: string) => (ev: MessageEvent) => {
            const data = JSON.parse(ev.data)
            groupChannel.onMessage({
                sender,
                data
            })
        }
        const handlers: Record<string, (ev: MessageEvent<any>) => void> = {}
        for (const [peerId, peer] of Object.entries(peerChannels)) {
            handlers[peerId] = buildOnMessage(peerId)
            peer.channels[label]?.addEventListener("message", handlers[peerId])
        }
        return () => {
            for (const [peerId, peer] of Object.entries(peerChannels)) {
                peer.channels[label]?.removeEventListener("message", handlers[peerId])
            }
        }
    }, [groupChannel?.onMessage, peerChannels])

    return groupChannel ?
        <GroupChannelContext.Provider value={groupChannel}>
            {children}
        </GroupChannelContext.Provider> : null;
}

export default GroupChannel;