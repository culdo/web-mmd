import useConfigStore from "@/app/stores/useConfigStore";
import { setPreset } from "@/app/stores/usePresetStore";
import { button, useControls } from "leva";
import { useEffect } from "react";
import { copyPreset, deletePreset, loadPreset, newPreset, saveConfigOnly, savePreset } from "./presetFn";

function usePreset() {
    const preset = useConfigStore(state => state.preset)
    const presetsList = useConfigStore(state => state.presetsList)
    const presetFn = {
        "New Preset": newPreset,
        "Copy Preset": copyPreset,
        "Delete Preset": deletePreset,
        "Save Preset": savePreset,
        "Save Config Only": saveConfigOnly,
        "Load Preset": loadPreset
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