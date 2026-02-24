import usePresetStore from "@/app/stores/usePresetStore";

async function onRead(name: string) {
    const { motionFiles } = usePresetStore.getState()
    return motionFiles[name];
}

export default onRead