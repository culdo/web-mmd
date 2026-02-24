import usePresetStore, { } from "@/app/stores/usePresetStore";

function onLoad(name: string, data: string) {
    usePresetStore.setState({ cameraFile: data })
}

export default onLoad;