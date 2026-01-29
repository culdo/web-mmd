import usePresetStore from "@/app/stores/usePresetStore";
import WithReady from "@/app/stores/WithReady";
import { buildGuiItem, loadModel } from "@/app/utils/gui";
import { button, useControls } from "leva";
import dynamic from "next/dynamic";
const Model = dynamic(() => import('./Model'), { ssr: false })

function Models() {
    const models = usePresetStore(state => state.models)
    const targetOptions = Object.keys(models)

    useControls("Model", {
        "target model": {
            ...buildGuiItem("targetModelId"),
            options: targetOptions
        },
        "add new model": button(() => {
            loadModel(true)
        })
    }, { order: 2, collapsed: true }, [targetOptions])

    return (
        <>
            {
                Object.entries(models).map(
                    ([id, props]) =>
                        <Model key={id} id={id} {...props} />
                )
            }
        </>
    )
}

export default WithReady(Models);