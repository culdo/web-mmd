import { useEffect } from "react";
import useOfferRTC from "../components/multiplayer/room/useOfferRTC";
import { useSearchParams } from "next/navigation";
import useChannel from "../components/multiplayer/room/useChannel";
import useSdpListener from "../components/multiplayer/room/useSdpListener";

function useWebRTC() {
  
  const searchParams = useSearchParams()
  const initUid = searchParams.get('initUid')
  const initCode = searchParams.get('initCode')
  useSdpListener(false)
  const buildConnect = useOfferRTC(initCode)
  const dataChannel = useChannel("ARCamera", 1, initUid)

  useEffect(() => {
    if (initUid) {
      buildConnect(initUid)()
    }
  }, [initUid]);

  return dataChannel
}



export default useWebRTC;
