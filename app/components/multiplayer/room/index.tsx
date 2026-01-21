import { getUsers } from "@/app/modules/firebase/init";
import { button, useControls } from "leva";
import { useState } from "react";
import PeerConnection from "./PeerConnection";
import useAnswerRTC from "./useAnswerRTC";
import { Schema } from "leva/dist/declarations/src/types";
import { setLevaValue } from "@/app/utils/gui";
import useDataListener from "./useDataListener";
import useGlobalStore from "@/app/stores/useGlobalStore";
import useConfigStore from "@/app/stores/useConfigStore";
import { isDev } from "@/app/utils/base";

function Room() {
    const uid = useConfigStore(state => state.uid);

    const peers = useGlobalStore(state => state.peers);
    const [joined, setJoined] = useState(false);

    useAnswerRTC();
    useDataListener()

    let roomControllers: Schema = {}
    if (!joined) {
        roomControllers = {
            "Join Room": button(async () => {
                if(!isDev) {
                    const resp = confirm("Join room and Allow connections from other users?");
                    if (!resp) return;
                }
                setJoined(true);

                const docs = await getUsers();
                docs.forEach((doc) => {
                    if (doc.id === uid) return;
                    peers[doc.id] = <PeerConnection key={doc.id} targetUid={doc.id} />;
                });
                useGlobalStore.setState({ peers: { ...peers } });
                setLevaValue("MultiPlayer.Online Users", `${docs.size} users`)
            })
        }
    } else {
        roomControllers = {
            "Leave Room": button(() => {
                setJoined(false);
                useGlobalStore.setState({ peers: {} });
            })
        }
    }

    useControls("MultiPlayer", () => (roomControllers), { order: 10 }, [roomControllers])

    return joined ? Object.values(peers) : null;
}

export default Room;