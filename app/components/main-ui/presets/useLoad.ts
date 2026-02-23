import { addPreset } from "@/app/stores/useConfigStore";
import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore, { migratePreset, setPreset } from "@/app/stores/usePresetStore";

function usePresetLoad() {

    return (name: string, data: string) => {
        addPreset(name)
        setPreset(name)
        const loadedPreset = JSON.parse(data)
        const { version } = usePresetStore.getState()
        if (version != loadedPreset.version) {
            migratePreset(loadedPreset, loadedPreset.version)
        } else {
            usePresetStore.setState(loadedPreset)
        }
        useGlobalStore.setState({ presetReady: true })
    };
}

export default usePresetLoad;