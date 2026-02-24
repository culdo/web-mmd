import usePresetStore from "@/app/stores/usePresetStore";
import Models from "./models";
import GroupChannel from "../../../../multiplayer/peer/channel/GroupChannel";
import useConfigStore from "@/app/stores/useConfigStore";

function Room() {
    return (
        <>
            <GroupChannel label="model" id={2}>
                <Models></Models>
            </GroupChannel>
        </>
    );
}

function Wrapper() {
    const enableMultiPlayer = usePresetStore(state => state.enableMultiPlayer);
    const uid = useConfigStore(state => state.uid);

    return (enableMultiPlayer && uid) ? <Room /> : null;
}

export default Wrapper;
