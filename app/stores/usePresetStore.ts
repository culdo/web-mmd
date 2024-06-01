import { create } from 'zustand';
import { PersistStorage, StorageValue, persist, subscribeWithSelector } from 'zustand/middleware'
import defaultConfig from '@/public/presets/Default_config.json';
import defaultData from '@/public/presets/Default_data.json';
import localforage from 'localforage'
import useConfigStore from './useConfigStore';

export type PresetState = typeof defaultConfig
export const presetSep = "."

const storage: PersistStorage<PresetState> = {
    getItem: async (name: string): Promise<StorageValue<PresetState>> => {
        console.log(name, 'has been retrieved')
        return (await localforage.getItem(name)) || null
    },
    setItem: async (name: string, value: StorageValue<PresetState>): Promise<void> => {
        console.log(name, 'with value', value, 'has been saved')
        await localforage.setItem(name, value)
    },
    removeItem: async (name: string): Promise<void> => {
        console.log(name, 'has been deleted')
        await localforage.removeItem(name)
    },
}

const usePresetStore = create(
    subscribeWithSelector(
        persist<PresetState>(
            (set, get) => defaultConfig,
            {
                name: useConfigStore.getState().preset,
                storage
            })
    )
)

usePresetStore.persist.onFinishHydration(() => {
    if (!usePresetStore.getState().pmxFiles) {
        usePresetStore.setState(defaultData)
    }
})


usePresetStore.subscribe(() => {
    if (usePresetStore.persist.hasHydrated() && useConfigStore.getState().preset == "Default") {
        useConfigStore.setState({ preset: "Untitled" })
    }
})

// move to here to avoid cycle imports
useConfigStore.subscribe((state) => state.preset, (newPreset) => {
    usePresetStore.persist.setOptions({ name: newPreset })
    usePresetStore.persist.rehydrate()
})

export default usePresetStore;