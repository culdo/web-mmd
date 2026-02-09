import { getActiveUsers, setUser } from "@/app/modules/firebase/init";
import { button, useControls } from "leva";
import { useEffect } from "react";
import PeerConnection from "../peer/PeerConnection";
import { Schema } from "leva/dist/declarations/src/types";
import useConfigStore from "@/app/stores/useConfigStore";
import useGlobalStore from "@/app/stores/useGlobalStore";
import GroupChannel from "../peer/channel/GroupChannel";
import Chat from "./chat";
import usePresetStore from "@/app/stores/usePresetStore";
import useOfferRTC from "../peer/useOfferRTC";
import Channel from "../peer/channel";

function Room() {
    const myUid = useConfigStore(state => state.uid);
    const peerChannels = useGlobalStore(state => state.peerChannels)
    const groupChannels = useGlobalStore(state => state.groupChannels)
    const connect = useOfferRTC()

    useEffect(() => {
        const init = async () => {
            // await setUser(myUid)
            const users = await getActiveUsers();
            const peerIds = users.docs.map(user => user.id).filter(id => id !== myUid)
            for (const peerId of peerIds) {
                if (!peerChannels[peerId]) {
                    connect(peerId)
                }
            }
        }
        init()
    }, [])

    return (
        <>
            {
                Object.keys(peerChannels).map(uid =>
                    <PeerConnection key={uid} id={uid}>
                        {
                            Object.values(groupChannels).map(groupChannel => groupChannel.createPeerChannel(uid))
                        }
                        <Channel label="fileTransfer" id={3}></Channel>
                    </PeerConnection>
                )
            }
            <GroupChannel label="chat" id={1}>
                <Chat></Chat>
            </GroupChannel>
        </>
    );
}

function Wrapper() {
    const enableMultiPlayer = usePresetStore(state => state.enableMultiPlayer);

    const roomControllers: Schema = enableMultiPlayer ? {
        "Leave Room": button(() => usePresetStore.setState({ enableMultiPlayer: false }))
    } : {
        "Join Room": button(() => usePresetStore.setState({ enableMultiPlayer: true }))
    }

    useControls("MultiPlayer", () => (roomControllers), { order: 10 }, [roomControllers])

    return enableMultiPlayer ? <Room /> : null;
}

export default Wrapper;
