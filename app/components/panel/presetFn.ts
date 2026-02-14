import useConfigStore, { addPreset, removePreset } from "@/app/stores/useConfigStore";
import usePresetStore, { migratePreset, resetPreset, setPreset } from "@/app/stores/usePresetStore";
import { startFileDownload } from "@/app/utils/base";
import path from "path-browserify";

export const newPreset = async () => {
    let newName = prompt("New preset name:");
    if (newName) {
        addPreset(newName)
        setPreset(newName)
        resetPreset()
    }
}

export const copyPreset = async () => {
    let newName = prompt("Copy as preset name:");
    if (newName) {
        addPreset(newName)
        setPreset(newName);
        usePresetStore.setState(state => ({ ...state }))
    }
}

export const deletePreset = async () => {
    if (confirm("Are you sure?")) {
        const presetName = useConfigStore.getState().preset
        removePreset(presetName)
        const { presetsList } = useConfigStore.getState()
        setPreset(presetsList[presetsList.length - 1], true);
    }
}

export const savePreset = () => {
    const presetBlob = new Blob([JSON.stringify(usePresetStore.getState())], { type: 'application/json' })
    const dlUrl = URL.createObjectURL(presetBlob)
    const presetName = useConfigStore.getState().preset
    startFileDownload(dlUrl, `${presetName}.json`)
}

export const saveConfigOnly = () => {
    const preset = usePresetStore.getState()
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
