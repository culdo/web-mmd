import defaultConfig from '@/app/presets/Default_config.json';
import localforage from 'localforage';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import useConfigStore from './useConfigStore';
import useGlobalStore from './useGlobalStore';
import { withProgress } from '../utils/base';
import { PersistStorage, StorageValue, persist } from '../middleware/persist';
import _ from 'lodash';

export type PresetState = typeof defaultConfig & {
    motionFiles: Record<string, string>,
    cameraFile: string,
    pmxFiles: {
        models: Record<string, string>,
        modelTextures: Record<string, Record<string, string>>
    },
    audioFile: string
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
            version: preset.version ?? 0
        }
    },
    setItem: async (name: string, value: StorageValue<PresetState>): Promise<void> => {
        console.log(name, 'with value', value.state, 'has been saved')
        document.title = "Web MMD (Saving...)"
        for (const [key, val] of Object.entries(value.state)) {
            await db.setItem(key, val)
        }
        await db.setItem("version", value.version)
        document.title = "Web MMD"
    },
    removeItem: async (name: string): Promise<void> => {
        console.log(name, 'has been deleted')
        await db.clear()
    },
}

const getDefaultPreset = async () => {
    const dataResp = withProgress(await fetch('presets/Default_data.json'), 38204932)
    const defaultData = await dataResp.json()
    return { ...defaultConfig, ...defaultData }
}

export const resetPreset = async ({ reactive } = { reactive: true }) => {
    const defaultPreset = await getDefaultPreset()
    if (reactive) {
        usePresetStore.setState(defaultPreset)
    } else {
        await storage.setItem(useConfigStore.getState().preset, { state: defaultPreset })
    }
}

export const migratePreset = async (preset: any, version: number) => {
    const defaultPreset = await getDefaultPreset()
    usePresetStore.setState(states => {
        _.defaults(states, defaultPreset)
        return { ...states }
    })
    return preset
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
                storage,
                version: 1,
                migrate: migratePreset
            })
    )
)

usePresetStore.persist.onFinishHydration(() => {
    useGlobalStore.setState({ presetReady: true })
})

usePresetStore.persist.onHydrate(() => {
    useGlobalStore.setState({ presetReady: false })
})

// move to here to avoid cycle imports
export const setPreset = async (newPresetName: string, rehydrate = false) => {
    useConfigStore.setState({ preset: newPresetName })
    usePresetStore.persist.setOptions({ name: newPresetName })
    db = localforage.createInstance({ name: newPresetName })
    if (rehydrate) {
        await usePresetStore.persist.rehydrate()
    }
}

export default usePresetStore;