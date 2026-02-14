import useGlobalStore from "@/app/stores/useGlobalStore";
import RemotePreset from "./preset-item/RemotePreset";
import LocalPreset from "./preset-item/LocalPreset";
import useConfigStore from "@/app/stores/useConfigStore";

function PresetsUI() {
    const peerChannels = useGlobalStore(state => state.peerChannels)
    const presetList = useConfigStore(state => state.presetsList)

    return (
        <>
            {
                presetList.map(presetName => <LocalPreset key={presetName} presetName={presetName}></LocalPreset>)
            }
            {
                Object.entries(peerChannels)
                    .filter(([_, pc]) => pc.channels["fileTransfer"])
                    .map(([sender, pc]) => <RemotePreset key={sender} channel={pc.channels["fileTransfer"]}></RemotePreset>)
            }
        </>
    );
}

export default PresetsUI;