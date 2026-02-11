import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import WithReady from "@/app/stores/WithReady";
import { buildGuiItem, loadModel } from "@/app/utils/gui";
import { Plane } from "@react-three/drei";
import { button, useControls } from "leva";
import dynamic from "next/dynamic";
const Model = dynamic(() => import('./Model'), { ssr: false })

function Models() {
    const models = usePresetStore(state => state.models)
    const remoteModels = useGlobalStore(state => state.remoteModels)
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

    const allModels = { ...models, ...remoteModels }
    if (Object.keys(allModels).length === 0) {
        return <Plane args={[100, 100]} rotation={[-Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="lightgray" />
        </Plane>
    }
    return (
        <>
            {
                Object.entries(allModels).map(
                    ([id, props]) =>
                        <Model key={id} id={id} {...props} />
                )
            }
        </>
    )
}

export default WithReady(Models);