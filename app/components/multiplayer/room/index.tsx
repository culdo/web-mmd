import { getActiveUsers, setUser } from "@/app/modules/firebase/init";
import { button, useControls } from "leva";
import { useEffect } from "react";
import PeerConnection from "../peer/PeerConnection";
import { Schema } from "leva/dist/declarations/src/types";
import useConfigStore from "@/app/stores/useConfigStore";
import useGlobalStore from "@/app/stores/useGlobalStore";
import Channel from "../peer/channel";
import Chat from "./chat";
import usePresetStore from "@/app/stores/usePresetStore";

function Room() {
    const myUid = useConfigStore(state => state.uid);
    const peerChannels = useGlobalStore(state => state.peerChannels)

    useEffect(() => {
        const init = async () => {
            // await setUser(myUid)
            const users = await getActiveUsers();
            useGlobalStore.setState(({ peerChannels }) => {
                const peerIds = users.docs.map(user => user.id).filter(id => id !== myUid)
                for (const peerId of peerIds) {
                    if (!peerChannels[peerId]) {
                        peerChannels[peerId] = {
                            peerConnection: null,
                            channels: {}
                        } as PeerChannel
                    }
                }
                return { peerChannels: { ...peerChannels } }
            })
        }
        init()
    }, [])

    return (
        <>
            {
                Object.keys(peerChannels).map(uid =>
                    <PeerConnection key={uid} id={uid}>
                        <Channel label="chat" id={1}></Channel>
                    </PeerConnection>
                )
            }
            <Chat></Chat>
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
