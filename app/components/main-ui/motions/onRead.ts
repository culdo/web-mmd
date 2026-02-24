import useConfigStore from "@/app/stores/useConfigStore";

async function onRead(name: string) {
    const { motionFiles } = useConfigStore.getState()
    return motionFiles[name];
}

export default onRead