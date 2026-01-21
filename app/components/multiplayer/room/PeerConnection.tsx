import { useControls, button } from "leva";
import { useEffect, useState } from "react";
import { Schema } from "leva/dist/declarations/src/types";
import useOfferRTC from "./useOfferRTC";

function PeerConnection({ targetUid, dataChannel, reset }: { targetUid: string, dataChannel?: RTCDataChannel, reset?: () => void }) {
    const buildConnect = useOfferRTC()
    const [controllers, setControllers] = useState<Schema>({})

    useControls(`MultiPlayer.Users.${targetUid}`, controllers, [controllers]);

    useEffect(() => {
        const newControllers: Schema = {}
        if (dataChannel) {
            newControllers["Disconnect"] = button(reset)
        } else {
            newControllers["Connect"] = button(buildConnect(targetUid))
        }
        setControllers(newControllers)

        if (dataChannel) {
            return () => reset();
        }

    }, [dataChannel])
    return <></>;
}

export default PeerConnection;