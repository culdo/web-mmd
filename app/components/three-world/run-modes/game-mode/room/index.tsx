import usePresetStore from "@/app/stores/usePresetStore";
import Models from "./models";
import GroupChannel from "../../../../multiplayer/peer/channel/GroupChannel";
import useGlobalStore from "@/app/stores/useGlobalStore";

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
    const configReady = useGlobalStore(state => state.configReady);

    return (enableMultiPlayer && configReady) ? <Room /> : null;
}

export default Wrapper;
