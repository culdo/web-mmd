import { useEffect, useRef } from "react";

const configuration = {
  iceServers: [{
    urls: "stun:stun.l.google.com:19302"
  }]
};

function useWebRTC() {
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  useEffect(() => {
    const peerConnection = new RTCPeerConnection();
    peerConnection.onicecandidate = setSDP;
    
    const dataChannel = peerConnection.createDataChannel('chat', { negotiated: true, id: 999 });
    dataChannel.onopen = datachannelopen;
    dataChannel.onmessage = datachannelmessage;
    dataChannelRef.current = dataChannel;

    document.getElementById('chatbutton').onclick = chatbuttonclick;
    document.getElementById('resetbutton').onclick = reset;

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

    function chatlog(msg: string) {
      const chatelement = document.getElementById('chatlog');
      const newchatentry = document.createElement("p");
      newchatentry.textContent = '[' + new Date() + '] ' + msg;
      chatelement.appendChild(newchatentry);
      chatelement.scrollTop = chatelement.scrollHeight
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
      if (event.candidate != null) {
        console.log('new ice candidate');
      } else {
        console.log('all ice candidates');
        const sdpStr = JSON.stringify(peerConnection.localDescription);
        const query = `/ar-camera?sdp=${encodeURIComponent(sdpStr)}`;
        window.history.pushState(null, "", query);
      }
    }

    function datachannelopen() {
      chatlog('connected');
    }

    function datachannelmessage(message: { data: any; }) {
      const text = message.data;
      chatlog(text);
    }

    function chatbuttonclick() {
      const textelement = document.getElementById('chatinput') as HTMLInputElement;
      const text = textelement.value
      dataChannel.send(text);
      chatlog(text);
      textelement.value = '';
    }

    function reset() {
      if (dataChannel) {
        dataChannel.close();
      }
      if (peerConnection) {
        peerConnection.close();
      }
      window.location.href = window.location.href.split("?")[0];;
    }
  }, []);

  return dataChannelRef.current
}



export default useWebRTC;
