import { addPreset } from "@/app/stores/useConfigStore";
import usePresetStore, { resetPreset, setPreset, storage } from "@/app/stores/usePresetStore";
import { startFileDownload } from "@/app/utils/base";

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
    const presetBlob = new Blob([JSON.stringify(preset)], { type: 'application/json' })
    const dlUrl = URL.createObjectURL(presetBlob)
    startFileDownload(dlUrl, `${preset}_config.json`)
}
