import usePresetStore from "@/app/stores/usePresetStore";
import LocalModel from "./LocalModel";

function LocalModels() {
    const pmxFiles = usePresetStore(state => state.pmxFiles)

    return (
        <>
            {
                Object.entries(pmxFiles.models).map(([name]) => <LocalModel key={name} name={name}></LocalModel>)
            }
        </>
    );
}

export default LocalModels;