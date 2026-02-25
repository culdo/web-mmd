import useConfigStore from "@/app/stores/useConfigStore";

async function onRead(name: string) {
    const { pmxFiles } = useConfigStore.getState()
    const data = {
        models: {
            [name]: pmxFiles.models[name]
        },
        modelTextures: {
            [name.split("/")[0]]: pmxFiles.modelTextures[name.split("/")[0]]
        }
    }
    return JSON.stringify(data);
}

export default onRead