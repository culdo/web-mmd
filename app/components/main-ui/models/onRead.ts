import usePresetStore from "@/app/stores/usePresetStore";

async function onRead(name: string) {
    const { pmxFiles } = usePresetStore.getState()
    return pmxFiles.models[name];
}

export default onRead