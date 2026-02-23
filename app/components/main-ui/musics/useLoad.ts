import usePresetStore, {  } from "@/app/stores/usePresetStore";

function useLoad() {
    return (name: string, data: string) => {
        usePresetStore.setState({ audioFile: data })
    };
}

export default useLoad;