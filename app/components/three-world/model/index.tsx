import Gui from "./Gui";
import usePresetStore from "@/app/stores/usePresetStore";
import WithReady from "@/app/stores/WithReady";
import dynamic from "next/dynamic";
const Model = dynamic(() => import('./Model'), { ssr: false })

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