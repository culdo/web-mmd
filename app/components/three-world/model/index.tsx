import Gui from "./Gui";
import usePresetStore from "@/app/stores/usePresetStore";
import Model from "./Model";
import WithReady from "@/app/stores/WithReady";

function Models() {
    const models = usePresetStore(state => state.models)

    return (
        <>
            {
                Object.entries(models).map(
                    ([id, props]) =>
                        <Model key={id} id={id} {...props} />
                )
            };
            <Gui></Gui>
        </>
    )
}

export default WithReady(Models);