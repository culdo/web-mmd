import useConfigStore, { addPreset } from "@/app/stores/useConfigStore";
import usePresetStore, { PresetState, resetPreset, setPreset, storage } from "@/app/stores/usePresetStore";
import { startFileDownload } from "@/app/utils/base";
import _ from "lodash";

export const getPreset = async (name: string) => {
    const preset = await storage.getItem(name)
    return preset.state
}

export const newPreset = async () => {
    let newName = prompt("New preset name:");
    if (newName) {
        addPreset(newName)
        setPreset(newName)
        resetPreset()
    }
}

export const copyPreset = async (name: string) => {
    let newName = prompt("Copy as preset name:");
    if (newName) {
        const preset = await getPreset(name)
        addPreset(newName)
        setPreset(newName);
        usePresetStore.setState(preset)
    }
}

export const saveFullPreset = async (name: string) => {
    const { cameraFiles, motionFiles, audioFiles, pmxFiles } = useConfigStore.getState()
    const motionFilesKeys = [...new Set(Object.values(usePresetStore.getState().models).flatMap(({ motionNames }) => motionNames))]
    await savePreset(name, (preset) => {
        _.merge(preset, {
            cameraFiles: {
                [preset.camera]: cameraFiles[preset.camera]
            },
            audioFiles: {
                [preset.musicName]: audioFiles[preset.musicName]
            },
            motionFiles: Object.fromEntries(
                motionFilesKeys.map((motionName) => [motionName, motionFiles[motionName]])
            ),
            pmxFiles: {
                models: Object.fromEntries(
                    Object.values(preset.models)
                        .map(({ fileName }) => [fileName, pmxFiles.models[fileName]])),
                modelTextures: Object.fromEntries(
                    Object.values(preset.models)
                        .map(({ fileName }) => [fileName.split("/")[0], pmxFiles.modelTextures[fileName.split("/")[0]]]))
            }
        })
    })
}

export const savePreset = async (name: string, presetCb: (preset: PresetState) => void = null) => {
    const preset = await getPreset(name) as any
    presetCb?.(preset)
    const presetBlob = new Blob([JSON.stringify(preset)], { type: 'application/json' })
    const dlUrl = URL.createObjectURL(presetBlob)
    startFileDownload(dlUrl, `${name}${presetCb ? "" : "_config"}.json`)
}
