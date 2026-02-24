import { getPreset } from "../../panel/presetFn";

function useRequest() {

    const onRequest = async (name: string) => {
        const preset = await getPreset(name)
        return JSON.stringify(preset)
    }

    return onRequest;
}

export default useRequest