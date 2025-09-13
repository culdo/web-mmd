import defaultConfig from '@/app/presets/Default_config.json';
import localforage from 'localforage';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { CameraClip } from '../components/three-world/camera/helper/composite-mode';
import useConfigStore from './useConfigStore';
import useGlobalStore from './useGlobalStore';
import { withProgress } from '../utils/base';
import { PersistStorage, StorageValue, persist } from '../middleware/persist';

export type PresetState = typeof defaultConfig & {
    motionFiles: Record<string, string>,
    cameraFile: string,
    pmxFiles: {
        models: Record<string, string>,
        modelTextures: Record<string, Record<string, string>>
    }
} & {
    compositeClips?: CameraClip[]
} & {
    // https://github.com/microsoft/TypeScript/issues/32063
    ["Character.position"]: [number, number, number]
    [key: `${string}.color`]: string,
    [key: `${string}.intensity`]: number,
    [key: `${string}.position`]: [number, number, number]
} & {
    Light: Record<string, any>,
    materials: Record<string, Record<string, any>>
} & {
    models: Record<string, {
        fileName: string,
        motionNames: string[],
        enableMorph: boolean,
        enablePhysics: boolean,
        enableMaterial: boolean
    }>,
}

let db = localforage.createInstance({ name: useConfigStore.getState().preset })

const storage: PersistStorage<PresetState> = {
    getItem: async (name: string): Promise<StorageValue<PresetState>> => {
        const keys = await db.keys()
        const preset = Object.fromEntries(await Promise.all(
            keys.map(async (key) =>
                [key, await db.getItem(key)]
            )
        ))
        console.log(name, 'has been retrieved', preset)
        return {
            state: preset,
            version: 0
        }
    },
    setItem: async (name: string, value: StorageValue<PresetState>): Promise<void> => {
        console.log(name, 'with value', value.state, 'has been saved')
        document.title = "Web MMD (Saving...)"
        for (const [key, val] of Object.entries(value.state)) {
            await db.setItem(key, val)
        }
        document.title = "Web MMD"
    },
    removeItem: async (name: string): Promise<void> => {
        console.log(name, 'has been deleted')
        await db.clear()
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
usePresetStore.persist.onFinishHydration(async (state) => {
    if (!state.pmxFiles?.models || !state.models?.character?.motionNames || Object.keys(state.motionFiles).length < 4) {
        const defaultData = await getDefaultDataWithProgress()
        usePresetStore.setState({ ...defaultData, ...defaultConfig })
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
    db = localforage.createInstance({ name: newPreset })
    usePresetStore.persist.rehydrate()
})

export default usePresetStore;