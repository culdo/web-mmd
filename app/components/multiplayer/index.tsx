import { setUser, setUserActive } from "@/app/modules/firebase/init";
import { useControls } from "leva";
import { useEffect, useRef } from "react";
import Room from "./room";
import useConfigStore from "@/app/stores/useConfigStore";
import { isDev } from "@/app/utils/base";
import useAnswerRTC from "./peer/useAnswerRTC";
import useSdpListener from "./peer/useSdpListener";
import FileTransfer from "./fileTransfer";
import { nanoid } from "nanoid";

useConfigStore.persist.onFinishHydration(async ({ uid }) => {
    if (uid) return
    const newUid = nanoid(7)
    useConfigStore.setState({ uid: newUid })
    console.log(`Create User: ${newUid}`)
    await setUser(newUid);
})

function Multiplayer() {
    const uid = useConfigStore(state => state.uid);

    const isActiveRef = useRef(true);
    useSdpListener();
    useAnswerRTC();

    const [_, set] = useControls("MultiPlayer", () => ({
        "Id": {
            value: "",
            editable: false
        }
    }), { order: 10, collapsed: true })

    useEffect(() => {
        const init = async () => {
            set({ Id: uid });
        }
        init();
    }, []);

    useEffect(() => {
        if (isDev) {
            setUserActive(uid, true);
            isActiveRef.current = true;
            return
        }

        const intervalId = setInterval(() => {
            if (navigator.userActivation.isActive) {
                if (!isActiveRef.current) {
                    setUserActive(uid, true);
                    isActiveRef.current = true;
                }
            } else {
                if (isActiveRef.current) {
                    setUserActive(uid, false);
                    isActiveRef.current = false;
                }
            }
        }, 10000);

        return () => {
            clearInterval(intervalId);
        }
    }, []);

    return (
        <>
            <Room />
            <FileTransfer />
        </>
    );
}

function Wrapper() {
    const uid = useConfigStore(state => state.uid);
    if (!uid) return null;
    return <Multiplayer />
}

export default Wrapper;