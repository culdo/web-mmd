import { addPreset } from "@/app/stores/useConfigStore";
import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore, { PresetState, setPreset } from "@/app/stores/usePresetStore";
import _ from "lodash";

async function onLoad(name: string, data: string, channel: JSONDataChannel = null) {
    const loadedPreset = JSON.parse(data) as PresetState
    const { camera, musicName, models } = loadedPreset
    useGlobalStore.setState({
        autoRequestResources: {
            Cameras: { [camera]: false },
            Musics: { [musicName]: false },
            Models: Object.fromEntries(Object.values(models).map(model => [model.fileName, false])),
            Motions: Object.fromEntries(_.flatMap(Object.values(models), model => model.motionNames).map(motion => [motion, false])),
            onAllLoaded: () => {
                addPreset(name)
                setPreset(name)
                usePresetStore.setState(loadedPreset)
                useGlobalStore.setState({ storeReady: true, openMainUI: false })
            }
        }
    })
}

export default onLoad;