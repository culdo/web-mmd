import usePresetStore, {  } from "@/app/stores/usePresetStore";

function useLoad() {

    return (name: string, data: string) => {
        usePresetStore.setState(({ pmxFiles }) => {
            pmxFiles.models[name] = data
            return { pmxFiles: { ...pmxFiles } }
        })
    };
}

export default useLoad;