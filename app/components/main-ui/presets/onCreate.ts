import useConfigStore, { addPreset } from "@/app/stores/useConfigStore";
import usePresetStore, { migratePreset, setPreset } from "@/app/stores/usePresetStore";
import { loadFile } from "@/app/utils/gui";
import path from "path-browserify";
import _ from "lodash";

function onCreate() {
    loadFile(async (file, fileName) => {
        const newName = path.parse(fileName).name
        addPreset(newName)
        setPreset(newName);
        const loadedPreset = JSON.parse(file)
        const mergeResources = (filesKey: FilesKey) => {
            if (filesKey in loadedPreset) {
                useConfigStore.setState(({ [filesKey]: filesState }) => {
                    _.merge(filesState, loadedPreset[filesKey])
                    return { [filesKey]: { ...filesState } }
                })
                delete loadedPreset[filesKey]
            }
        }
        mergeResources("audioFiles")
        mergeResources("motionFiles")
        mergeResources("pmxFiles")
        mergeResources("cameraFiles")
        usePresetStore.setState(loadedPreset)
    }, false)
}

export default onCreate;