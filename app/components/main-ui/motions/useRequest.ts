import usePresetStore from "@/app/stores/usePresetStore";

function useRequest() {
    const motionFiles = usePresetStore(state => state.motionFiles)
    
    const onRequest = (name: string) => Promise.resolve(motionFiles[name])

    return onRequest;
}

export default useRequest