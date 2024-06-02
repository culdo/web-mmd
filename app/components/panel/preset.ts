import useConfigStore from "@/app/stores/useConfigStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { startFileDownload } from "@/app/utils/base";
import { button, folder, useControls } from "leva";
import path from "path-browserify";

function usePreset() {
    const preset = useConfigStore(state => state.preset)
    const presetsList = useConfigStore(state => state.presetsList)
    const addPreset = useConfigStore(state => state.addPreset)
    const removePreset = useConfigStore(state => state.removePreset)

    const getApi = usePresetStore.getState

    const _loadPreset = (name: string) => {
        if(preset == name) throw "same preset name"
        useConfigStore.setState({ preset: name })
    }

    const presetFn = {
        newPreset: async () => {
            let newName = prompt("New preset name:");
            if (newName) {
                addPreset(newName)
                _loadPreset(newName);
            }
        },
        copyPreset: async () => {
            let newName = prompt("New preset name:");
            if (newName) {
                useConfigStore.setState({ preset: newName })
                addPreset(newName)
            }
        },
        deletePreset: async () => {
            if (confirm("Are you sure?")) {
                removePreset(preset)

                const presetsArr: any[] = Array.from(presetsList)
                _loadPreset(presetsArr[presetsArr.length - 1]);
            }
        },
        savePreset: () => {
            const presetBlob = new Blob([JSON.stringify(getApi())], { type: 'application/json' })
            const dlUrl = URL.createObjectURL(presetBlob)
            startFileDownload(dlUrl, `${preset}.json`)
        },
        saveConfigOnly: () => {
            const apiCopy = JSON.parse(JSON.stringify(getApi()))
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
                addPreset(newName)

                let reader = new FileReader();
                reader.readAsText(presetFile);
                reader.onloadend = async () => {
                    useConfigStore.setState({ preset: newName })
                    usePresetStore.setState(JSON.parse(reader.result as string))
                    _loadPreset(newName);
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
    const presetsFolder = folder({
        preset: {
            value: preset,
            options: presetsList,
            settings: {
                collapsed: false
            },
            onChange: (val, prop, options) => {
                controllers.deletePreset.settings.disabled = (val == "Default")
                if(!options.initial) {
                    _loadPreset(val)
                }
            }
        }
    })
    Object.assign(controllers, {
        presets: presetsFolder
    })
    useControls('Preset', controllers, {order: 100},[preset, presetsList])
}

export default usePreset;