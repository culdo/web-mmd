import localforage from 'localforage';
import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { setUser } from '../modules/firebase/init';

export type ConfigState = {
    preset: string,
    presetsList: Array<string>,
    addPreset: (newPreset: string) => void,
    removePreset: (targetPreset: string) => void,
    uid: string;
    setUid: (uid: string) => void,
    _hasHydrated: boolean,
    setHasHydrated: (state: boolean) => void,
}

const useConfigStore = create(
    subscribeWithSelector(
        persist<ConfigState>(
            (set, get) => ({
                preset: "Default",
                presetsList: ["Default"],
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
                }),
                uid: "",
                setUid: (uid) => set({ uid }),
                _hasHydrated: false,
                setHasHydrated: (state) => {
                    set({
                        _hasHydrated: state
                    });
                }
            }), {
            name: "mmd-storage",
            onRehydrateStorage: () => async (state) => {
                if (!state.uid) {
                    const uid = nanoid(7)
                    state?.setUid(uid);
                    await setUser(uid);
                }
                state?.setHasHydrated(true);
            }
        }
        )
    )
)

export default useConfigStore;