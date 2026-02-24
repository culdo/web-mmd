import { addPreset } from "@/app/stores/useConfigStore";
import usePresetStore, { migratePreset, resetPreset, setPreset, storage } from "@/app/stores/usePresetStore";
import { startFileDownload } from "@/app/utils/base";
import path from "path-browserify";

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

export const savePreset = async (name: string) => {
    const preset = await getPreset(name)

    const presetBlob = new Blob([JSON.stringify(preset)], { type: 'application/json' })
    const dlUrl = URL.createObjectURL(presetBlob)
    startFileDownload(dlUrl, `${name}.json`)
}

export const saveConfigOnly = async (name: string) => {
    const preset = await getPreset(name)
    delete preset.pmxFiles
    delete preset.cameraFile
    delete preset.motionFiles
    delete preset.audioFile
    const presetBlob = new Blob([JSON.stringify(preset)], { type: 'application/json' })
    const dlUrl = URL.createObjectURL(presetBlob)
    startFileDownload(dlUrl, `${preset}_config.json`)
}

export const loadPreset = () => {
    const selectFile = document.getElementById("selectFile")
    selectFile.onchange = async function (e: any) {
        const files = e.target.files
        if (files.length < 1) {
            return
        }
        const presetFile = files[0]
        const newName = path.parse(presetFile.name).name

        let reader = new FileReader();
        reader.readAsText(presetFile);
        reader.onloadend = async () => {
            addPreset(newName)
            setPreset(newName);
            const loadedPreset = JSON.parse(reader.result as string)
            const { version } = usePresetStore.getState()
            if (version != loadedPreset.version) {
                await migratePreset(loadedPreset, loadedPreset.version)
            } else {
                usePresetStore.setState(loadedPreset)
            }
        }
    };
    selectFile.click();
}
