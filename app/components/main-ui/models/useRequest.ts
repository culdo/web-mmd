import usePresetStore from "@/app/stores/usePresetStore";

function useRequest() {
    const pmxFiles = usePresetStore(state => state.pmxFiles)

    const onRequest = (name: string) => Promise.resolve(pmxFiles.models[name])

    return onRequest;
}

export default useRequest