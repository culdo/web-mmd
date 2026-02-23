interface JSONDataChannel extends RTCDataChannel {
  send: (data: any) => void;
}
