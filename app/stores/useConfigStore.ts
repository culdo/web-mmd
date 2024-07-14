import localforage from 'localforage';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware'

export type ConfigState = {
    preset: string,
    presetsList: Array<string>,
    loadPreset: (presetName: string) => void,
    addPreset: (newPreset: string) => void,
    removePreset: (targetPreset: string) => void
}

const useConfigStore = create(
    subscribeWithSelector(
        persist<ConfigState>(
            (set, get) => ({
                preset: "Default",
                presetsList: ["Default"],
                loadPreset: (presetName: string) => set({ preset: presetName }),
                addPreset: (newPreset: string) => set(state => {
                    const set = new Set(state.presetsList)
                    const presetsList = Array.from(set.add(newPreset))
                    return { presetsList }
                }),
                removePreset: (targetPreset: string) => set(state => {
                    const set = new Set(state.presetsList)
                    set.delete(targetPreset)
                    const presetsList = Array.from(set)
                    localforage.removeItem(targetPreset)
                    return { presetsList }
                })
            }), {
            name: "mmd-storage",
        })
    )
)

export default useConfigStore;