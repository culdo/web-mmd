import { setUserActive } from "@/app/modules/firebase/init";
import { useControls } from "leva";
import { useEffect, useRef } from "react";
import Room from "./room";
import useConfigStore from "@/app/stores/useConfigStore";
import { isDev } from "@/app/utils/base";
import useAnswerRTC from "./room/useAnswerRTC";
import useSdpListener from "./room/useSdpListener";

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

    return <Room />;
}

function Wrapper() {
    const hasHydrated = useConfigStore(state => state._hasHydrated);
    if (!hasHydrated) return null;
    return <Multiplayer />
}

export default Wrapper;