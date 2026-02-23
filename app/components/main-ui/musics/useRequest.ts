import usePresetStore from "@/app/stores/usePresetStore";

function useRequest() {
    const audioFile = usePresetStore(state => state.audioFile)

    const onRequest = (name: string) => Promise.resolve(audioFile)

    return onRequest;
}

export default useRequest;