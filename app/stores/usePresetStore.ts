import defaultConfig from '@/app/presets/Default_config.json';
import localforage from 'localforage';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import useConfigStore from './useConfigStore';
import useGlobalStore from './useGlobalStore';
import { PersistStorage, StorageValue, persist } from '../middleware/persist';
import _ from 'lodash';
import { demoPresetUrl } from "@/app/config";
import { withProgress } from '../utils/base';

export type PresetState = typeof defaultConfig & {
    // https://github.com/microsoft/TypeScript/issues/32063
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
        enableMaterial: boolean,
        morphs?: Record<string, number>,
    }>,
}

const initPresetName = useConfigStore.getState().preset
let db = localforage.createInstance({ name: initPresetName })

export const storage: PersistStorage<PresetState> = {
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

export const resetPreset = async ({ reactive } = { reactive: true }) => {
    if (reactive) {
        usePresetStore.setState(defaultConfig as PresetState)
    } else {
        await storage.setItem(useConfigStore.getState().preset, { state: defaultConfig as PresetState })
    }
}

export const migratePreset = async (persistedState: any, version: number) => {
    if (!demoPresetUrl) return persistedState
    const dataResp = withProgress(await fetch(demoPresetUrl), 33699845)
    const defaultData = await dataResp.json()
    const defaultDataOnly = _.pick(defaultData, ["motionFiles", "cameraFiles", "pmxFiles", "audioFiles"])
    const defaultConfigOnly = _.pick(defaultData, Object.keys(defaultConfig))
    useConfigStore.setState(defaultDataOnly)
    usePresetStore.setState(defaultConfigOnly)
    return persistedState
}

const usePresetStore = create(
    subscribeWithSelector(
        persist<PresetState>(
            () => {
                return {
                    ...defaultConfig,
                } as PresetState
            },
            {
                name: initPresetName,
                storage,
                version: 1,
                migrate: migratePreset
            })
    )
)

usePresetStore.persist.onFinishHydration((state) => {

    useGlobalStore.setState({ presetReady: true })
    if (useGlobalStore.getState().configReady) {
        useGlobalStore.setState({ storeReady: true })
    }
})

usePresetStore.persist.onHydrate(() => {
    useGlobalStore.setState({ presetReady: false, storeReady: false })
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

useConfigStore.persist.onFinishHydration(async ({ preset }) => {
    if (initPresetName == preset) return
    await setPreset(preset, true)
})

export default usePresetStore;