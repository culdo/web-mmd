class JSONDataChannel extends RTCDataChannel {
    constructor(channel: RTCDataChannel) {
        super();
        Object.assign(this, channel)
    }

    send(data: any) {
        super.send(JSON.stringify(data))
    }

    addEventListener<K extends keyof RTCDataChannelEventMap>(type: K, listener: (ev: RTCDataChannelEventMap[K]) => void) {
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
        super.addEventListener(type, handler)
    }
}

export default JSONDataChannel;