import { create } from 'zustand';
import { PersistStorage, StorageValue, persist } from 'zustand/middleware'
import defaultConfig from '@/public/presets/Default_config.json';
import { setItem, getItem, removeItem } from 'localforage'

export type PresetState = typeof defaultConfig
export const presetSep = "."

const getItemKey = (name: string) => `${usePresetStore.persist.getOptions().name}${presetSep}${name}`

const storage: PersistStorage<PresetState> = {
    getItem: async (name: string): Promise<StorageValue<PresetState>> => {
        const key = getItemKey(name)
        console.log(key, 'has been retrieved')
        return (await getItem(key)) || null
    },
    setItem: async (name: string, value: StorageValue<PresetState>): Promise<void> => {
        const key = getItemKey(name)
        console.log(key, 'with value', value, 'has been saved')
        await setItem(key, value)
    },
    removeItem: async (name: string): Promise<void> => {
        const key = getItemKey(name)
        console.log(key, 'has been deleted')
        await removeItem(key)
    },
}

const usePresetStore = create(
    persist<PresetState>(
        (set, get) => defaultConfig,
        {
            name: "Default",
            storage
        })
)

export default usePresetStore;