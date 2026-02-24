import useConfigStore from "@/app/stores/useConfigStore";

async function onRead(name: string) {
    const { audioFiles } = useConfigStore.getState()
    return audioFiles[name];
}

export default onRead;