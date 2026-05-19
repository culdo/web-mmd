import { getPreset } from "./presetFn";

async function onRead(name: string) {
    const preset = await getPreset(name)
    return JSON.stringify(preset)
}

export default onRead