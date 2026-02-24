import useConfigStore, { removePreset } from "@/app/stores/useConfigStore";
import { setPreset } from "@/app/stores/usePresetStore";
import wrapOnDelete from "../resources/wrapOnDelete";

function onDelete(name: string) {
    if (confirm("Are you sure?")) {
        removePreset(name)
        const { preset, presetsList } = useConfigStore.getState()
        if (name == preset) {
            setPreset(presetsList[presetsList.length - 1], true);
        }
    }
}

export default wrapOnDelete(onDelete);