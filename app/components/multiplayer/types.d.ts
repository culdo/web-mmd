type UserInfo = {
    id: string
    active: boolean
    sdp: RTCSessionDescriptionInit
    offerId: string
}

type PeerChannel = {
    connection?: RTCPeerConnection,
    channels?: Record<string, RTCDataChannel>
}

type OneToManyChannel = {
    send: (data: any) => void,
    onMessage: (data: any) => void
}
