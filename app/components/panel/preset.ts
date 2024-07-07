import useConfigStore from "@/app/stores/useConfigStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { startFileDownload } from "@/app/utils/base";
import { button, useControls } from "leva";
import path from "path-browserify";
import defaultConfig from '@/app/configs/Default_config.json';
import defaultData from '@/app/configs/Default_data.json';
import { useEffect, useLayoutEffect } from "react";
import localforage from "localforage";

function usePreset() {
    const preset = useConfigStore(state => state.preset)
    const presetsList = useConfigStore(state => state.presetsList)
    const addPreset = useConfigStore(state => state.addPreset)
    const removePreset = useConfigStore(state => state.removePreset)

    const getApi = usePresetStore.getState

    const loadPreset = (name: string) => {
        useConfigStore.setState({ preset: name })
    }

    const presetFn = {
        "New Preset": async () => {
            let newName = prompt("New preset name:");
            if (newName) {
                addPreset(newName)
                loadPreset(newName);
            }
        },
        "Copy Preset": async () => {
            let newName = prompt("New preset name:");
            if (newName) {
                useConfigStore.setState({ preset: newName })
                addPreset(newName)
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
            apiCopy.material = []
            const presetBlob = new Blob([JSON.stringify(apiCopy)], { type: 'application/json' })
            const dlUrl = URL.createObjectURL(presetBlob)
            startFileDownload(dlUrl, `${preset}_config.json`)
        },
        "Load Preset": () => {
            const selectFile = document.getElementById("selectFile")
            selectFile.onchange = async function (e: any) {
                const presetFile = e.target.files
                const newName = path.parse(presetFile.name).name
                addPreset(newName)

                let reader = new FileReader();
                reader.readAsText(presetFile);
                reader.onloadend = async () => {
                    useConfigStore.setState({ preset: newName })
                    usePresetStore.setState(JSON.parse(reader.result as string))
                    loadPreset(newName);
                }
            };
            selectFile.click();
        },
        "Reset Preset": () => {
            usePresetStore.setState(defaultConfig)
            usePresetStore.setState(defaultData)
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
                if (!options.initial) {
                    loadPreset(val)
                }
            }
        },
        ...controllers
    }), { order: 100, collapsed: true }, [controllers, presetsList])

    useEffect(() => {
        setGui({ preset })
    }, [preset])
}

export default usePreset;