import useGlobalStore from "@/app/stores/useGlobalStore";
import { withProgress } from "@/app/utils/base";
import localforage from "localforage";
import { useEffect } from "react";

function useConfig() {
    const { gui } = useGlobalStore()

    const _getConfig = async () => {
        const configSep = "."

        const configSaver = {
            set: (target: any, key: any, value: undefined) => {
                const { preset } = useGlobalStore.getState()
                gui.panel.title("Controls (Saving...)");
                const saveAsync = async () => {
                    const targetPreset = preset == "Default" ? "Untitled" : preset;
                    await localforage.setItem(`${targetPreset}${configSep}${key}`, value)
                    if (preset == "Default" && gui.changeToUntitled) {
                        await gui.changeToUntitled()
                    }
                    gui.panel.title("Controls");
                };
                if (value !== undefined) {
                    saveAsync();
                }
                // need to put this outside of async func(above) to set back to api for reading
                const result = Reflect.set(target, key, value)
                return result
            }
        };

        const configResp = await fetch('presets/Default_config.json')

        const defaultConfig = await configResp.json()

        let userConfig = JSON.parse(JSON.stringify(defaultConfig));

        const savedPresetName = await localforage.getItem<string>("currentPreset")
        const preset = savedPresetName ?? "Default"
        if (!savedPresetName) {
            await localforage.setItem("currentPreset", "Default")
        }

        const savedPresetsList = await localforage.getItem<string[]>("presetsList")
        const presetsList = savedPresetsList ?? new Set(["Default"])

        // always loads config from localforage (include data)
        await localforage.iterate((val, key) => {
            if (key.startsWith(`${preset}${configSep}`)) {
                const configKey = key.split(`${preset}${configSep}`)[1]
                userConfig[configKey] = val
            }
        })

        // if loaded config not includes data, we loads from Default data json.
        if (!savedPresetName || !("pmxFiles" in userConfig)) {
            const dataResp = withProgress(await fetch('presets/Default_data.json'), 38204932)
            const defaultData = await dataResp.json()
            for (const [key, val] of Object.entries(defaultData)) {
                await localforage.setItem(`${preset}${configSep}${key}`, val);
                userConfig[key] = val
            }
        }

        const api = new Proxy(userConfig, configSaver);

        useGlobalStore.setState({ defaultConfig, api, preset, presetsList })
    }
    useEffect(() => {
        if (!gui) return
        _getConfig()
    }, [gui])
}

export default useConfig;