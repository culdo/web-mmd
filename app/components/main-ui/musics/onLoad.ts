import useConfigStore from "@/app/stores/useConfigStore";
import usePresetStore from "@/app/stores/usePresetStore";

function onLoad(name: string, data: string, channel: JSONDataChannel = null) {
    useConfigStore.setState(({ audioFiles }) => {
        audioFiles[name] = data
        return { audioFiles: { ...audioFiles } }
    })
    usePresetStore.setState({ musicName: name })
}

export default onLoad;