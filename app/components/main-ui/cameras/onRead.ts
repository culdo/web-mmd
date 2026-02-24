import usePresetStore from "@/app/stores/usePresetStore";

async function onRead(name: string) {
    const { cameraFile } = usePresetStore.getState()
    return cameraFile;
}

export default onRead