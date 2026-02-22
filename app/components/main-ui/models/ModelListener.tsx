import WithLocalModels from "./WithLocalModels";
import ResourceListener from "../../multiplayer/fileTransfer/ResourceListener";
import usePresetStore from "@/app/stores/usePresetStore";

function ModelListener({ name }: { name: string }) {
    const pmxFiles = usePresetStore(state => state.pmxFiles)
    
    const onRequest = (name: string) => Promise.resolve(pmxFiles.models[name])

    return (
        <ResourceListener
            type="model"
            name={name}
            onRequest={onRequest}
        >
        </ResourceListener>
    );
}

export default WithLocalModels(ModelListener, "model");