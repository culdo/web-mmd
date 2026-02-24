import useConfigStore from "@/app/stores/useConfigStore";

async function onRead(name: string) {
    const { pmxFiles } = useConfigStore.getState()
    return pmxFiles.models[name];
}

export default onRead