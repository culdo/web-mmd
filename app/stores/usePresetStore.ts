import defaultConfig from '@/app/presets/Default_config.json';
import localforage from 'localforage';
import { create } from 'zustand';
import { PersistStorage, StorageValue, persist, subscribeWithSelector } from 'zustand/middleware';
import { CameraClip } from '../components/three-world/camera/helper/composite-mode';
import useConfigStore from './useConfigStore';
import useGlobalStore from './useGlobalStore';
import { withProgress } from '../utils/base';

export type PresetState = typeof defaultConfig & {
    motionFile: string,
    cameraFile: string,
    pmxFiles: {
        character: Record<string, string>,
        stage: Record<string, string>,
        modelTextures: {
            character: Record<string, Record<string, string>>,
            stage: Record<string, Record<string, string>>
        }
    }
} & {
    compositeClips?: CameraClip[]
} & {
    [key: `${string}.color`]: string,
    [key: `${string}.intensity`]: number,
    [key: `${string}.position`]: number[]
} & {
    Light: Record<string, any>,
    material: Record<string, any>
}

const storage: PersistStorage<PresetState> = {
    getItem: async (name: string): Promise<StorageValue<PresetState>> => {
        console.log(name, 'has been retrieved')
        return (await localforage.getItem(name)) || null
    },
    setItem: async (name: string, value: StorageValue<PresetState>): Promise<void> => {
        if (!useGlobalStore.getState().presetReady) return
        console.log(name, 'with value', value, 'has been saved')
        document.title = "Web MMD (Saving...)"
        await localforage.setItem(name, value)
        document.title = "Web MMD"
    },
    removeItem: async (name: string): Promise<void> => {
        console.log(name, 'has been deleted')
        await localforage.removeItem(name)
    },
}

const getDefaultDataWithProgress = async () => {
    const dataResp = withProgress(await fetch('presets/Default_data.json'), 38204932)
    return await dataResp.json()
}

export const resetPreset = async () => {
    const defaultData = await getDefaultDataWithProgress()
    usePresetStore.setState({ ...defaultConfig, ...defaultData })
}

const usePresetStore = create(
    subscribeWithSelector(
        persist<PresetState>(
            () => {
                return {
                    ...defaultConfig
                } as PresetState
            },
            {
                name: useConfigStore.getState().preset,
                storage
            })
    )
)

let presetReadySolve: () => void
useGlobalStore.setState({
    presetReadyPromise: new Promise<void>((resolve) => {
        presetReadySolve = resolve
    })
})
usePresetStore.persist.onFinishHydration(async () => {
    if (!usePresetStore.getState()["pmxFiles"]) {
        const defaultData = await getDefaultDataWithProgress()
        usePresetStore.setState({ ...defaultData })
    }
    presetReadySolve()
    useGlobalStore.setState({ presetReady: true })
})

usePresetStore.persist.onHydrate(() => {
    useGlobalStore.setState({
        presetReady: false,
        presetReadyPromise: new Promise<void>((resolve) => {
            presetReadySolve = resolve
        })
    })
})

// move to here to avoid cycle imports
useConfigStore.subscribe((state) => state.preset, (newPreset) => {
    usePresetStore.persist.setOptions({ name: newPreset })
    usePresetStore.persist.rehydrate()
})

export default usePresetStore;