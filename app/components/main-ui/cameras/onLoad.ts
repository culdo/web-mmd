import useConfigStore from "@/app/stores/useConfigStore";
import usePresetStore from "@/app/stores/usePresetStore";

function onLoad(name: string, data: string) {
    useConfigStore.setState(({ cameraFiles }) => {
        cameraFiles[name] = data
        return { cameraFiles: { ...cameraFiles } }
    })
    usePresetStore.setState({ camera: name })
}

export default onLoad;