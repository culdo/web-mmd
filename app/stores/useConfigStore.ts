import localforage from 'localforage';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware'
import { PersistStorage, StorageValue, persist } from '../middleware/persist';
import _ from 'lodash';
import useGlobalStore from './useGlobalStore';

export type ConfigState = {
    preset: string,
    presetsList: Array<string>,
    presetsInfo: Record<string, {
        screenShot: string,
    }>,
    uid: string;
    fileHashes: Record<string, string>,
    motionFiles: Record<string, string>,
    cameraFiles: Record<string, string>,
    pmxFiles: {
        models: Record<string, string>,
        modelTextures: Record<string, Record<string, string>>
    },
    audioFiles: Record<string, string>
}

const db = localforage.createInstance({ name: "mmd-storage" })

export const storage: PersistStorage<ConfigState> = {
    getItem: async (name: string): Promise<StorageValue<ConfigState>> => {
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
    setItem: async (name: string, value: StorageValue<ConfigState>): Promise<void> => {
        document.title = "Web MMD (Saving...)"
        for (const [key, val] of Object.entries(value.state)) {
            await db.setItem(key, val)
        }
        console.log(name, 'with value', value.state, 'has been saved')
        await db.setItem("version", value.version)
        document.title = "Web MMD"
    },
    removeItem: async (name: string): Promise<void> => {
        console.log(name, 'has been deleted')
        await db.clear()
    },
}

const migrate = async (states: any, version: number) => {
    return states
}

const useConfigStore = create(
    subscribeWithSelector(
        persist<ConfigState>(
            () => ({
                preset: "Default",
                presetsList: ["Default"],
                presetsInfo: {},
                uid: "",
                fileHashes: {},
                motionFiles: {},
                cameraFiles: {},
                pmxFiles: {
                    models: {},
                    modelTextures: {}
                },
                audioFiles: {}
            }), {
            name: "mmd-storage",
            storage,
            version: 1,
            migrate
        }
        )
    )
)

useConfigStore.persist.onFinishHydration(() => {
    useGlobalStore.setState({ configReady: true })
    if (useGlobalStore.getState().presetReady) {
        useGlobalStore.setState({ storeReady: true })
    }
})

useConfigStore.persist.onHydrate(() => {
    useGlobalStore.setState({ configReady: false, storeReady: false })
})

export const addPreset = (newPreset: string) => useConfigStore.setState(state => {
    const set = new Set(state.presetsList)
    const presetsList = Array.from(set.add(newPreset))
    return { presetsList }
})

export const removePreset = (targetPreset: string) => {
    useConfigStore.setState(({ presetsList }) => {
        const set = new Set(presetsList)
        set.delete(targetPreset)
        return { presetsList: [...set] }
    })
    localforage.dropInstance({ name: targetPreset })
}

export default useConfigStore;