import usePresetStore, { } from "@/app/stores/usePresetStore";

function onLoad(name: string, data: string) {
    usePresetStore.setState(({ pmxFiles }) => {
        pmxFiles.models[name] = data
        return { pmxFiles: { ...pmxFiles } }
    })
}

export default onLoad;