import defaultConfig from '@/app/configs/Default_config.json';
import defaultData from '@/app/configs/Default_data.json';
import localforage from 'localforage';
import { create } from 'zustand';
import { PersistStorage, StorageValue, persist, subscribeWithSelector } from 'zustand/middleware';
import { CameraClip } from '../components/three-world/camera/helper/composite-mode';
import useConfigStore from './useConfigStore';
import useGlobalStore from './useGlobalStore';

export type PresetState = typeof defaultConfig & {
    compositeClips: CameraClip[]
} & { [key: `${string}.color`]: string, [key: `${string}.intensity`]: number, [key: `${string}.position`]: number[] }
    & { Light: Record<string, any> }
    & { material: Record<string, any>};
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
            (set, get) => ({ ...defaultConfig, ...defaultData }) as PresetState,
            {
                name: useConfigStore.getState().preset,
                storage
            })
    )
)

export const resetPreset = () => usePresetStore.setState({ ...defaultConfig, ...defaultData })

usePresetStore.persist.onFinishHydration(() => {
    useGlobalStore.setState({ presetReady: true })
})

usePresetStore.persist.onHydrate(() => {
    useGlobalStore.setState({ presetReady: false })
})

// move to here to avoid cycle imports
useConfigStore.subscribe((state) => state.preset, (newPreset) => {
    usePresetStore.persist.setOptions({ name: newPreset })
    usePresetStore.persist.rehydrate()
})

export default usePresetStore;