import usePresetStore, { } from "@/app/stores/usePresetStore";

function useLoad() {

    return (name: string, data: string) => {
        usePresetStore.setState({ cameraFile: data })
    };
}

export default useLoad;