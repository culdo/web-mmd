import { storage } from "@/app/stores/usePresetStore";

function useRequest() {

    const onRequest = async (name: string) => {
        const preset = await storage.getItem(name)
        return JSON.stringify(preset.state)
    }

    return onRequest;
}

export default useRequest