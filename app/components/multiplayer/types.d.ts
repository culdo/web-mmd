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
    send: (data: any) => void,
    onMessage: (data: any) => void
    onOpen: (sender: string) => void
    onClose: (sender: string) => void
}
