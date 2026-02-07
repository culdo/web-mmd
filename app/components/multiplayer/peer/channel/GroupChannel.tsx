import { createContext, useEffect } from "react";
import useGlobalStore from "@/app/stores/useGlobalStore";
import useConfigStore from "@/app/stores/useConfigStore";
import Channel from ".";

export const GroupChannelContext = createContext<GroupChannel>(null)

function GroupChannel({ label, id, peerIds = [], broadcast = true, children }: { label: string, id: number, peerIds?: string[], broadcast?: boolean, children?: React.ReactNode }) {
    const peerChannels = useGlobalStore(state => state.peerChannels)
    const groupChannels = useGlobalStore(state => state.groupChannels)
    const groupChannel = groupChannels[label]
    const uid = useConfigStore(state => state.uid);

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
                send: () => { },
            }
            return { groupChannels: { ...groupChannels } }
        })
    }, [])

    // set up send of group channel
    useEffect(() => {
        if (!groupChannel) return
        groupChannel.send = (data: any) => {
            for (const p of Object.values(peerChannels)) {
                if (p.channels[label]?.readyState == "open") {
                    p.channels[label]?.send(JSON.stringify({
                        sender: uid,
                        data
                    }))
                }
            }
        }
    }, [peerChannels, groupChannel])

    // set up onMessage of group channel
    useEffect(() => {
        if (!groupChannel?.onMessage) return
        const onMessage = (ev: MessageEvent) => {
            const data = JSON.parse(ev.data)
            groupChannel.onMessage(data)
        }
        for (const p of Object.values(peerChannels)) {
            p.channels[label]?.addEventListener("message", onMessage)
        }
        return () => {
            for (const p of Object.values(peerChannels)) {
                p.channels[label]?.removeEventListener("message", onMessage)
            }
        }
    }, [groupChannel?.onMessage, peerChannels])

    // clean up
    useEffect(() => {
        return () => {
            useGlobalStore.setState(({ groupChannels }) => {
                delete groupChannels[label]
                return { groupChannels: { ...groupChannels } }
            })
        }
    }, [])
    return groupChannel ?
        <GroupChannelContext.Provider value={groupChannel}>
            {children}
        </GroupChannelContext.Provider> : null;
}

export default GroupChannel;