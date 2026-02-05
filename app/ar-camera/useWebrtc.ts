import { useEffect } from "react";
import useOfferRTC from "../components/multiplayer/peer/useOfferRTC";
import { useSearchParams } from "next/navigation";
import useChannel from "../components/multiplayer/peer/channel/useChannel";
import useSdpListener from "../components/multiplayer/peer/useSdpListener";

function useWebRTC() {
  
  const searchParams = useSearchParams()
  const initUid = searchParams.get('initUid')
  const initCode = searchParams.get('initCode')
  useSdpListener(false)
  const connect = useOfferRTC(initUid, initCode)
  const dataChannel = useChannel("ARCamera", 1, initUid)

  useEffect(() => {
    if (initUid) {
      connect()
    }
  }, [initUid]);

  return dataChannel
}



export default useWebRTC;
