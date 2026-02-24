import useConfigStore from "@/app/stores/useConfigStore";

function onLoad(name: string, data: string) {
    useConfigStore.setState(({ pmxFiles }) => {
        pmxFiles.models[name] = data
        return { pmxFiles: { ...pmxFiles } }
    })
}

export default onLoad;