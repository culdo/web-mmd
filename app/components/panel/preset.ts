import useConfigStore from "@/app/stores/useConfigStore";
import usePresetStore, { resetPreset } from "@/app/stores/usePresetStore";
import { startFileDownload } from "@/app/utils/base";
import { button, LevaInputs, useControls } from "leva";
import path from "path-browserify";
import { useEffect } from "react";

function usePreset() {
    const preset = useConfigStore(state => state.preset)
    const presetsList = useConfigStore(state => state.presetsList)
    const addPreset = useConfigStore(state => state.addPreset)
    const removePreset = useConfigStore(state => state.removePreset)
    const loadPreset = useConfigStore(state => state.loadPreset)

    const getApi = usePresetStore.getState
    
    const presetFn = {
        "New Preset": async () => {
            let newName = prompt("New preset name:");
            if (newName) {
                addPreset(newName)
                loadPreset(newName);
                resetPreset()
            }
        },
        "Copy Preset": async () => {
            let newName = prompt("Copy as preset name:");
            if (newName) {
                addPreset(newName)
                loadPreset(newName);
            }
        },
        "Delete Preset": async () => {
            if (confirm("Are you sure?")) {
                removePreset(preset)
                const { presetsList } = useConfigStore.getState()
                loadPreset(presetsList[presetsList.length - 1]);
            }
        },
        "Save Preset": () => {
            const presetBlob = new Blob([JSON.stringify(getApi())], { type: 'application/json' })
            const dlUrl = URL.createObjectURL(presetBlob)
            startFileDownload(dlUrl, `${preset}.json`)
        },
        "Save Config Only": () => {
            const apiCopy = JSON.parse(JSON.stringify(getApi()))
            delete apiCopy.pmxFiles
            delete apiCopy.cameraFile
            delete apiCopy.motionFile
            const presetBlob = new Blob([JSON.stringify(apiCopy)], { type: 'application/json' })
            const dlUrl = URL.createObjectURL(presetBlob)
            startFileDownload(dlUrl, `${preset}_config.json`)
        },
        "Load Preset": () => {
            const selectFile = document.getElementById("selectFile")
            selectFile.onchange = async function (e: any) {
                const files = e.target.files
                if(files.length < 1) {
                    return
                }
                const presetFile = files[0]
                const newName = path.parse(presetFile.name).name
                
                let reader = new FileReader();
                reader.readAsText(presetFile);
                reader.onloadend = async () => {
                    addPreset(newName)
                    loadPreset(newName);
                    usePresetStore.setState(JSON.parse(reader.result as string))
                }
            };
            selectFile.click();
        },
        "Reset Preset": resetPreset
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
                if (!options.initial) {
                    loadPreset(val)
                }
            }
        },
        ...controllers,
        version: {
            type: LevaInputs.STRING,
            value: process.env.COMMIT.slice(0, 7),
            editable: false
        },
    }), { order: 900, collapsed: true }, [controllers, presetsList])

    useEffect(() => {
        setGui({ preset })
    }, [preset])
}

export default usePreset;