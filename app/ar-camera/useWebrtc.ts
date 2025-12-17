import { use, useEffect, useRef, useState } from "react";

const configuration = {
  iceServers: [{
    urls: "stun:stun.l.google.com:19302"
  }]
};

function useWebRTC() {
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  useEffect(() => {
    if (dataChannel) return;
    const peerConnection = new RTCPeerConnection();
    peerConnection.onicecandidate = setSDP;

    const _dataChannel = peerConnection.createDataChannel('chat', { negotiated: true, id: 999 });
    _dataChannel.onopen = () => {
      setDataChannel(_dataChannel);
    };

    const urlParams = new URLSearchParams(window.location.search);
    const sdp = JSON.parse(urlParams.get('sdp'));
    if (!sdp) {
      // offering side
      startOffering();
      // listening for answer via cookie
      cookieStore.onchange = async (event: CookieChangeEvent) => {
        const sdp = JSON.parse(event.changed[0].value);
        await peerConnection.setRemoteDescription(sdp);
      };
    } else if (sdp.type === 'offer') {
      // answering side
      takeOffer(sdp);
    } else if (sdp.type === 'answer') {
      // offering side
      setAnswer(sdp);
    }

    async function startOffering() {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
    }

    async function takeOffer(offer: any) {
      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
    }

    function setAnswer(sdp: any) {
      setCookie('sdp', JSON.stringify(sdp));
      window.close();
    }

    function setCookie(name: string, value: string, days = 1) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      const expires = "expires=" + date.toUTCString();
      document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }

    function setSDP(event: RTCPeerConnectionIceEvent) {
      if (event.candidate === null) {
        const sdpStr = JSON.stringify(peerConnection.localDescription);
        const url = `./ar-camera.html?sdp=${encodeURIComponent(sdpStr)}`;
        window.history.pushState(null, "", url);
      }
    }

    function reset() {
      if (_dataChannel) {
        _dataChannel.close();
      }
      if (peerConnection) {
        peerConnection.close();
      }
      window.history.pushState(null, "", "./");
    }

    return () => {
      reset();
    }
  }, []);

  return dataChannel
}



export default useWebRTC;
