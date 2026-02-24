import useConfigStore from "@/app/stores/useConfigStore";

async function onRead(name: string) {
    const { cameraFiles } = useConfigStore.getState()
    return cameraFiles[name];
}

export default onRead