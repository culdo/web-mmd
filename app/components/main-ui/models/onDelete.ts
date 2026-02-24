import usePresetStore from "@/app/stores/usePresetStore";

function onDelete(name: string) {
    usePresetStore.setState(({ pmxFiles }) => {
        delete pmxFiles.models[name]
        return { pmxFiles: { ...pmxFiles } }
    })
}

export default onDelete;