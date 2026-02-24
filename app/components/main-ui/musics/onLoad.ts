import usePresetStore, {  } from "@/app/stores/usePresetStore";

function onLoad(name: string, data: string) {
    usePresetStore.setState({ audioFile: data })
}

export default onLoad;