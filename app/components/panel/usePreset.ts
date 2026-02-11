import useConfigStore from "@/app/stores/useConfigStore";
import usePresetStore, { migratePreset, resetPreset, setPreset } from "@/app/stores/usePresetStore";
import { startFileDownload } from "@/app/utils/base";
import { button, useControls } from "leva";
import path from "path-browserify";
import { useEffect } from "react";

function usePreset() {
    const preset = useConfigStore(state => state.preset)
    const presetsList = useConfigStore(state => state.presetsList)
    const addPreset = useConfigStore(state => state.addPreset)
    const removePreset = useConfigStore(state => state.removePreset)

    const getPresetStates = usePresetStore.getState

    const presetFn = {
        "New Preset": async () => {
            let newName = prompt("New preset name:");
            if (newName) {
                addPreset(newName)
                setPreset(newName)
                resetPreset()
            }
        },
        "Copy Preset": async () => {
            let newName = prompt("Copy as preset name:");
            if (newName) {
                addPreset(newName)
                setPreset(newName);
                usePresetStore.setState(state => ({ ...state }))
            }
        },
        "Delete Preset": async () => {
            if (confirm("Are you sure?")) {
                removePreset(preset)
                const { presetsList } = useConfigStore.getState()
                setPreset(presetsList[presetsList.length - 1], true);
            }
        },
        "Save Preset": () => {
            const presetBlob = new Blob([JSON.stringify(getPresetStates())], { type: 'application/json' })
            const dlUrl = URL.createObjectURL(presetBlob)
            startFileDownload(dlUrl, `${preset}.json`)
        },
        "Save Config Only": () => {
            const preset = getPresetStates()
            delete preset.pmxFiles
            delete preset.cameraFile
            delete preset.motionFiles
            delete preset.audioFile
            const presetBlob = new Blob([JSON.stringify(preset)], { type: 'application/json' })
            const dlUrl = URL.createObjectURL(presetBlob)
            startFileDownload(dlUrl, `${preset}_config.json`)
        },
        "Load Preset": () => {
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
    }

    const controllers = Object.fromEntries(
        Object.entries(presetFn).map(
            ([k, v]) => [k, button(v)]
        )
    )
    controllers["Delete Preset"].settings.disabled = (preset == "Default")

    const [_, setGui] = useControls('Preset', () => ({
        preset: {
            value: preset,
            options: presetsList,
            settings: {
                collapsed: false
            },
            onChange: (val, prop, options) => {
                if (!options.initial && options.fromPanel) {
                    setPreset(val, true)
                }
            }
        },
        ...controllers
    }), { order: 900, collapsed: true }, [controllers, presetsList])

    useEffect(() => {
        setGui({ preset })
    }, [preset])
}

export default usePreset;