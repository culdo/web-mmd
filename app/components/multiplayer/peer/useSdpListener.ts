import { listenOnConnections } from "@/app/modules/firebase/init";
import { useEffect, useRef } from "react";
import useGlobalStore from "@/app/stores/useGlobalStore";
import useConfigStore from "@/app/stores/useConfigStore";

function useSdpListener() {
    const uid = useConfigStore(state => state.uid);
    const onOfferingRef = useGlobalStore(state => state.onOfferingRef);
    const onAnsweringRef = useGlobalStore(state => state.onAnsweringRef);

    useEffect(() => {
        const unsub = listenOnConnections(uid, async (cid: string, data: ConnectionInfo) => {
            onOfferingRef.current[cid]?.(data);
            onAnsweringRef.current?.(data);
        })
        return () => unsub();
    }, []);
}

export default useSdpListener;