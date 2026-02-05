import { useContext } from "react";
import useChannel from "./useChannel";
import { PeerContext } from "../PeerConnection";

function Channel({ label, id }: { label: string, id: number }) {
    const { peerId } = useContext(PeerContext)
    useChannel(label, id, peerId)
    return <></>;
}

export default Channel;