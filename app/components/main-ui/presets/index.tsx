import useGlobalStore from "@/app/stores/useGlobalStore";
import RemotePreset from "./preset-item/RemotePreset";
import LocalPreset from "./preset-item/LocalPreset";
import { WithTargetModel } from "../../three-world/model/helper/useTargetModel";

function PresetsUI() {
    const peerChannels = useGlobalStore(state => state.peerChannels)
    return (
        <>
            <LocalPreset></LocalPreset>
            {
                Object.entries(peerChannels)
                    .filter(([_, pc]) => pc.channels["fileTransfer"])
                    .map(([sender, pc]) => <RemotePreset key={sender} channel={pc.channels["fileTransfer"]}></RemotePreset>)
            }
        </>
    );
}

export default WithTargetModel(PresetsUI);