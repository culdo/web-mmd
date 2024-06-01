import useGlobalStore from "@/app/stores/useGlobalStore";
import { startFileDownload } from "@/app/utils/base";
import { button, folder, useControls } from "leva";
import localforage from "localforage";
import path from "path-browserify";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

function usePreset() {
    const preset = useGlobalStore(state => state.preset)
    const presetsList = useGlobalStore(state => state.presetsList)
    const api = useGlobalStore(useShallow(state => state.api))

    const _loadPreset = async (name: string) => {
        if(preset == name) return

        useGlobalStore.setState({ preset: name })
    }

    const updateDropdown = () => {
        if (preset == "Default") {
            controllers.deletePreset.settings.disabled = true
        } else {
            controllers.deletePreset.settings.disabled = false
        }
    }

    const _updatePresetList = async (newName: string) => {
        presetsList.add(newName)
    }

    const presetFn = {
        newPreset: async () => {
            let newName = prompt("New preset name:");
            if (newName) {
                await _updatePresetList(newName)
                await _loadPreset(newName);
            }
        },
        copyPreset: async () => {
            let newName = prompt("New preset name:");
            if (newName) {
                useGlobalStore.setState({ preset: newName })
                Object.assign(api, api);
                await _updatePresetList(newName)
                updateDropdown();
            }
        },
        deletePreset: async () => {
            if (confirm("Are you sure?")) {
                presetsList.delete(preset)

                const presetsArr: any[] = Array.from(presetsList)
                await _loadPreset(presetsArr[presetsArr.length - 1]);
            }
        },
        savePreset: () => {
            const presetBlob = new Blob([JSON.stringify(api)], { type: 'application/json' })
            const dlUrl = URL.createObjectURL(presetBlob)
            startFileDownload(dlUrl, `${preset}.json`)
        },
        saveConfigOnly: () => {
            const apiCopy = JSON.parse(JSON.stringify(api))
            delete apiCopy.pmxFiles
            delete apiCopy.cameraFile
            delete apiCopy.motionFile
            apiCopy.material = []
            const presetBlob = new Blob([JSON.stringify(apiCopy)], { type: 'application/json' })
            const dlUrl = URL.createObjectURL(presetBlob)
            startFileDownload(dlUrl, `${preset}_config.json`)
        },
        loadPreset: () => {
            const selectFile = document.getElementById("selectFile")
            selectFile.onchange = async function (e: any) {
                const presetFile = e.target.files
                const newName = path.parse(presetFile.name).name
                await _updatePresetList(newName)

                let reader = new FileReader();
                reader.readAsText(presetFile);
                reader.onloadend = async () => {
                    useGlobalStore.setState({ preset: newName })
                    Object.assign(api, JSON.parse(reader.result as string));
                    await _loadPreset(newName);
                }
            };
            selectFile.click();
        }
    }

    const changeToUntitled = async () => {
        console.log("changeToUntitled")
        useGlobalStore.setState({ preset: "Untitled" })
        await _updatePresetList("Untitled")
        updateDropdown()
    }

    const controllers = Object.fromEntries(
        Object.entries(presetFn).map(
            ([k, v]) => [k, button(v)]
        )
    )
    const presetsFolder = folder({
        preset: {
            value: preset,
            options: presetsList,
            settings: {
                collapsed: false
            },
            onChange: (val, prop, options) => {
                if(!options.initial) {
                    _loadPreset(val)
                }
            }
        }
    })
    Object.assign(controllers, {
        presets: presetsFolder
    })
    useControls('Preset', controllers, [preset, presetsList])
    useEffect(() => {
        useGlobalStore.setState({ changeToUntitled })
    }, [])
    // init dropdown
    updateDropdown();

}

export default usePreset;