import usePresetStore from "@/app/stores/usePresetStore";

function onDelete(name: string) {
    usePresetStore.setState(({ motionFiles }) => {
        delete motionFiles[name]
        return { motionFiles: { ...motionFiles } }
    })
}

export default onDelete;