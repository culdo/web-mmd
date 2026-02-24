import usePresetStore from "@/app/stores/usePresetStore";

async function onRead(name: string) {
    const { audioFile } = usePresetStore.getState()
    return audioFile;
}

export default onRead;