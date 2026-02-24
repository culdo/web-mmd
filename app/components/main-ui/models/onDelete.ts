import useConfigStore from "@/app/stores/useConfigStore";

function onDelete(name: string) {
    useConfigStore.setState(({ pmxFiles }) => {
        delete pmxFiles.models[name]
        return { pmxFiles: { ...pmxFiles } }
    })
}

export default onDelete;