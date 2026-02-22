import ResourceListener from "../../multiplayer/fileTransfer/ResourceListener";
import { storage } from "@/app/stores/usePresetStore";
import WithLocalPresets from "./WithLocalPresets";

function PresetListener({ name }: { name: string }) {

    const onRequest = async (name: string) => {
        const preset = await storage.getItem(name)
        return JSON.stringify(preset)
    }

    return (
        <ResourceListener
            type="preset"
            name={name}
            onRequest={onRequest}
        >
        </ResourceListener>
    );
}

export default WithLocalPresets(PresetListener, "preset");