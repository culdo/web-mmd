import { addPreset } from "@/app/stores/useConfigStore";
import usePresetStore, { migratePreset, setPreset } from "@/app/stores/usePresetStore";
import { loadFile } from "@/app/utils/gui";
import path from "path-browserify";

function onCreate() {
    loadFile(async (file, name) => {
        const newName = path.parse(name).name
        addPreset(newName)
        setPreset(newName);
        const loadedPreset = JSON.parse(file)
        const { version } = usePresetStore.getState()
        if (version != loadedPreset.version) {
            await migratePreset(loadedPreset, loadedPreset.version)
        } else {
            usePresetStore.setState(loadedPreset)
        }
    }, false)
}

export default onCreate;