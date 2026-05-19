import useConfigStore from "@/app/stores/useConfigStore";

function onLoad(name: string, data: string, channel: JSONDataChannel = null) {
    useConfigStore.setState(({ motionFiles }) => {
        return { motionFiles: { ...motionFiles, [name]: data } }
    })
}

export default onLoad;