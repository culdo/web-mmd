import usePresetStore from "@/app/stores/usePresetStore";
import { useCallback } from "react";

function isRenderGui(modelName: string) {
    const { targetModelId } = usePresetStore.getState()
    return targetModelId == modelName
}

export default isRenderGui;