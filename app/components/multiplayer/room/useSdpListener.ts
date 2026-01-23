import { listenOnUser } from "@/app/modules/firebase/init";
import { useEffect, useRef } from "react";
import useGlobalStore from "@/app/stores/useGlobalStore";
import useConfigStore from "@/app/stores/useConfigStore";

function useSdpListener(inited = true) {
    const uid = useConfigStore(state => state.uid);
    const onOfferingRef = useGlobalStore(state => state.onOfferingRef);
    const onAnsweringRef = useGlobalStore(state => state.onAnsweringRef);
    const initRef = useRef(inited);

    useEffect(() => {
        const unsub = listenOnUser(uid, async (data: any) => {
            if (!initRef.current) {
                initRef.current = true
                return
            }
            onOfferingRef.current?.(data);
            onAnsweringRef.current?.(data);
        })
        return () => unsub();
    }, []);
}

export default useSdpListener;