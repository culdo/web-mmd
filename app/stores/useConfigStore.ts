import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware'
import usePresetStore from './usePresetStore';

export type ConfigState = {
    defaultConfig: any,
    preset: string,
    presetsList: Set<string>,
}

const useConfigStore = create(
    subscribeWithSelector(
        persist<ConfigState>(
            (set, get) => ({
                defaultConfig: null,
                preset: "Default",
                presetsList: new Set(["Default"]),
            }), {
            name: "mmd-storage",
        })
    )
)

useConfigStore.subscribe((state) => state.preset, (newPreset) => {
    usePresetStore.persist.setOptions({ name: newPreset })
    usePresetStore.persist.rehydrate()
})

export default useConfigStore;