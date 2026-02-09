import useGlobalStore from "@/app/stores/useGlobalStore";
import { useEffect, useState } from "react";

function useChannel(label: string, id: number, peerIdOrCode: string) {
    const peerChannels = useGlobalStore(state => state.peerChannels)
    const onInitRef = useGlobalStore(state => state.onInitRef)

    const [peerId, setPeerId] = useState<string>(peerIdOrCode)
    const peerConnection = peerChannels[peerId]?.connection
    useEffect(() => {
        if (!peerConnection) {
            onInitRef.current = (code, peerId) => {
                if (peerIdOrCode == code) {
                    setPeerId(peerId);
                    onInitRef.current = null;
                }
            }
        }
    }, [peerConnection])

    const dataChannel = peerChannels[peerId].channels[label]
    
    useEffect(() => {
        if (!peerConnection) return
        const newDataChannel = peerConnection.createDataChannel(label, { negotiated: true, id });
        const { groupChannels } = useGlobalStore.getState()

        // Wrap the send and addEventListener to automatically stringify and parse JSON data
        const rawSend = newDataChannel.send.bind(newDataChannel)
        newDataChannel.send = (data: any) => {
            rawSend(JSON.stringify(data))
        }
        const rawAddEventListener = newDataChannel.addEventListener.bind(newDataChannel)
        newDataChannel.addEventListener = <K extends keyof RTCDataChannelEventMap>(type: K, listener: (ev: RTCDataChannelEventMap[K]) => void) => {
            let handler = listener;
            if (type === "message") {
                handler = (ev) => {
                    const parsedData = JSON.parse((ev as MessageEvent).data)
                    listener({
                        ...ev,
                        data: parsedData,
                    })
                }
            }
            rawAddEventListener(type, handler)
        }

        newDataChannel.onopen = () => {
            useGlobalStore.setState(({peerChannels}) => {
                peerChannels[peerId].channels[label] = newDataChannel
                return {peerChannels: {...peerChannels}}
            })
            groupChannels[label]?.onOpen?.(peerId)
        };
        newDataChannel.onclose = () => {
            useGlobalStore.setState(({peerChannels}) => {
                // Issue: https://github.com/facebook/react/issues/16728
                const channel = peerChannels[peerId]?.channels[label]
                if(!channel) return {}
                delete peerChannels[peerId].channels[label]
                return {peerChannels: {...peerChannels}}
            })
            groupChannels[label]?.onClose?.(peerId)
        };
    }, [peerConnection])

    useEffect(() => {
        if (dataChannel) {
            return () => {
                dataChannel.close()
            }
        }
    }, [dataChannel])

    return dataChannel;
}

export default useChannel;