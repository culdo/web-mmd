import usePresetStore, {  } from "@/app/stores/usePresetStore";

function useLoad() {

    return (name: string, data: string) => {
        usePresetStore.setState(({ motionFiles }) => {
            return { motionFiles: { ...motionFiles, [name]: data } }
        })
    };
}

export default useLoad;