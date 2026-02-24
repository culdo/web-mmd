import useConfigStore from "@/app/stores/useConfigStore";

function onDelete(name: string) {
    useConfigStore.setState(({ motionFiles }) => {
        delete motionFiles[name]
        return { motionFiles: { ...motionFiles } }
    })
}

export default onDelete;