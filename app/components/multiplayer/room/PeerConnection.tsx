import { useControls, button } from "leva";
import { useEffect, useState } from "react";
import { Schema } from "leva/dist/declarations/src/types";
import useOfferRTC from "./useOfferRTC";

function PeerConnection({ targetUid, initChannel, reset }: { targetUid: string, initChannel?: RTCDataChannel, reset?: () => void }) {
    const buildConnect = useOfferRTC()
    const [controllers, setControllers] = useState<Schema>({})

    useControls(`MultiPlayer.Users.${targetUid}`, controllers, [controllers]);

    useEffect(() => {
        const newControllers: Schema = {}
        if (initChannel) {
            newControllers["Disconnect"] = button(reset)
        } else {
            newControllers["Connect"] = button(buildConnect(targetUid))
        }
        setControllers(newControllers)

        if (initChannel) {
            return () => reset();
        }

    }, [initChannel])
    return <></>;
}

export default PeerConnection;