import { getUserCounts, setUserActive } from "@/app/modules/firebase/init";
import { useControls } from "leva";
import { useEffect, useRef } from "react";
import Room from "./room";
import useConfigStore from "@/app/stores/useConfigStore";
import { isDev } from "@/app/utils/base";

function Multiplayer() {
    const uid = useConfigStore(state => state.uid);

    const isActiveRef = useRef(true);

    const [gui, set] = useControls("MultiPlayer", () => ({
        "Id": {
            value: "",
            editable: false
        },
        "Online Users": {
            value: "0 users",
            editable: false,
        },
        "Always online": isDev
    }), { order: 10 })

    useEffect(() => {
        const init = async () => {
            const counts = await getUserCounts()
            set({ Id: uid, "Online Users": `${counts} users` });
        }
        init();
    }, []);

    useEffect(() => {
        if (gui["Always online"]) {
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
    }, [gui["Always online"]]);

    return <Room />;
}

function Wrapper() {
    const hasHydrated = useConfigStore(state => state._hasHydrated);
    if (!hasHydrated) return null;
    return <Multiplayer />
}

export default Wrapper;