import usePresetStore from "@/app/stores/usePresetStore";

function useRequest() {
    const cameraFile = usePresetStore(state => state.cameraFile)
    
    const onRequest = (name: string) => Promise.resolve(cameraFile)

    return onRequest;
}

export default useRequest