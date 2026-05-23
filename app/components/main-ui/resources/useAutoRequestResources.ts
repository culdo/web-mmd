import useGlobalStore from "@/app/stores/useGlobalStore";
import { useEffect } from "react";

function useAutoRequestResources() {
    const autoRequestResources = useGlobalStore(state => state.autoRequestResources)

    useEffect(() => {
        if (!autoRequestResources) return
        const { Cameras, Musics, Models, Motions } = autoRequestResources
        const allResourcesLoaded = [Cameras, Musics, Models, Motions].map(resources => Object.values(resources).every(v => v)).every(v => v)
        if (allResourcesLoaded) {
            autoRequestResources.onAllLoaded()
        }
    }, [autoRequestResources])
    
    return autoRequestResources;
}

export default useAutoRequestResources;