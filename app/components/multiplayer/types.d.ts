type ConnectionInfo = {
    peerA: string
    peerB: string
    sdp: RTCSessionDescriptionInit
}

type PeerChannel = {
    connection?: RTCPeerConnection,
    channels?: Record<string, RTCDataChannel>
}

type OneToManyChannel = {
    send: (data: any) => void,
    onMessage: (data: any) => void
}
