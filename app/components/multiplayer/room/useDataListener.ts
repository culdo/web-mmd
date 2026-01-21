import { listenOnUser } from "@/app/modules/firebase/init";
import { useRef, useEffect } from "react";
import useGlobalStore from "@/app/stores/useGlobalStore";
import useConfigStore from "@/app/stores/useConfigStore";

function useDataListener() {
    const uid = useConfigStore(state => state.uid);
    const initRef = useRef(false);
    const onOfferingRef = useGlobalStore(state => state.onOfferingRef);
    const onAnsweringRef = useGlobalStore(state => state.onAnsweringRef);

    useEffect(() => {
        const unsub = listenOnUser(uid, async (data: any) => {

            onOfferingRef.current?.(data);
            onAnsweringRef.current?.(data);
        })
        return () => unsub();
    }, []);
}

export default useDataListener;