import localforage from 'localforage';
import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware'
import { PersistStorage, StorageValue, persist } from '../middleware/persist';
import { setUser } from '../modules/firebase/init';
import _ from 'lodash';
import { withProgress } from '../utils/base';
import useGlobalStore from './useGlobalStore';

export type ConfigState = {
    preset: string,
    presetsList: Array<string>,
    presetsInfo: Record<string, {
        screenShot: string,
    }>,
    uid: string;
    fileHashes: Record<string, Record<string, string>>,
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
    const dataResp = withProgress(await fetch('presets/Default_data.json'), 33699845)
    const defaultData = await dataResp.json()
    useConfigStore.setState(states => {
        _.defaults(states, defaultData)
        return { ...states }
    })
    console.log("migrate ConfigStore")
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
                motionFiles: undefined,
                cameraFiles: undefined,
                pmxFiles: undefined,
                audioFiles: undefined
            }), {
            name: "mmd-storage",
            storage,
            version: 1,
            migrate
        }
        )
    )
)

useConfigStore.persist.onFinishHydration(async ({ uid }) => {
    if (!uid) {
        const uid = nanoid(7)
        useConfigStore.setState({ uid })
        console.log(`Create User: ${uid}`)
        await setUser(uid);
    }
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