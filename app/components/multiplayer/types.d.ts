type ConnectionInfo = {
    peerA: string
    peerB: string
    sdp: RTCSessionDescriptionInit
}

type PeerChannel = {
    connection?: RTCPeerConnection,
    channels?: Record<string, RTCDataChannel>
}

type GroupChannel = {
    createPeerChannel: (peerId: string) => React.ReactNode
    send: (data: any) => void
    onMessage: ({ sender, data }: { sender: string, data: any }) => void
    onOpen: (sender: string) => void
    onClose: (sender: string) => void
    sharedObjects?: {
        chatTextRef: MutableRefObject<any>
        remoteTextRefs: Record<string, MutableRefObject<any>>
    }
}

type EventData = {
    type: string
    payload: any
}

type DataSchema = {
    uri: string
    payload: any
}

type ResourceType = "preset" | "motion" | "model" | "camera" | "music"
