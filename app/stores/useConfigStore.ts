import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware'

export type ConfigState = {
    preset: string,
    presetsList: Set<string>,
    addPreset: (newPreset: string) => void,
    removePreset: (targetPreset: string) => void
}

const useConfigStore = create(
    subscribeWithSelector(
        persist<ConfigState>(
            (set, get) => ({
                preset: "Default",
                presetsList: new Set(["Default"]),
                addPreset: (newPreset: string) => set(state => ({ presetsList: state.presetsList.add(newPreset) })),
                removePreset: (targetPreset: string) => set(state => {
                    state.presetsList.delete(targetPreset)
                    return { presetsList:  state.presetsList }
                })
            }), {
            name: "mmd-storage",
        })
    )
)

export default useConfigStore;