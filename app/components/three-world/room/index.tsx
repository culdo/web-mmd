import useConfigStore from "@/app/stores/useConfigStore";
import usePresetStore from "@/app/stores/usePresetStore";
import Models from "./models";
import GroupChannel from "../../multiplayer/peer/channel/GroupChannel";

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
    const hasHydrated = useConfigStore(state => state._hasHydrated);

    return (enableMultiPlayer && hasHydrated) ? <Room /> : null;
}

export default Wrapper;
