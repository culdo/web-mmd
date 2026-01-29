import { getActiveUsers } from "@/app/modules/firebase/init";
import { button, useControls } from "leva";
import { useEffect, useState } from "react";
import PeerConnection from "./PeerConnection";
import { Schema } from "leva/dist/declarations/src/types";
import { setLevaValue } from "@/app/utils/gui";
import useGlobalStore from "@/app/stores/useGlobalStore";
import useConfigStore from "@/app/stores/useConfigStore";

function Room() {
    const uid = useConfigStore(state => state.uid);
    const peers = useGlobalStore(state => state.peers);

    useEffect(() => {
        const init = async () => {
            const docs = await getActiveUsers();
            docs.forEach((doc) => {
                if (doc.id === uid) return;
                peers[doc.id] = <PeerConnection key={doc.id} targetUid={doc.id} />;
            });
            useGlobalStore.setState({ peers: { ...peers } });
        }
        init()

        return () => {
            useGlobalStore.setState({ peers: {} });
        }
    }, [])

    return Object.values(peers);
}

function Wrapper() {
    const [joined, setJoined] = useState(false);

    const roomControllers: Schema = joined ? {
        "Leave Room": button(() => setJoined(false))
    } : {
        "Join Room": button(() => setJoined(true))
    }

    useControls("MultiPlayer", () => (roomControllers), { order: 10 }, [roomControllers])

    return joined ? <Room /> : null;
}

export default Wrapper;
