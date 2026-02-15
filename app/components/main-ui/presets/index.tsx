import LocalPreset from "./LocalPreset";
import useConfigStore from "@/app/stores/useConfigStore";

function LocalPresets() {
    const presetList = useConfigStore(state => state.presetsList)

    return (
        <>
            {
                presetList.map(presetName => <LocalPreset key={presetName} presetName={presetName}></LocalPreset>)
            }
        </>
    );
}

export default LocalPresets;