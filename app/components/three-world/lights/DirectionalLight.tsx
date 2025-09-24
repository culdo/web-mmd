import useGlobalStore from "@/app/stores/useGlobalStore"
import usePresetStore from "@/app/stores/usePresetStore"
import { buildFlexGuiItem } from "@/app/utils/gui"
import { button, folder, useControls } from "leva"

function DirectionalLight({ name }: { name?: string }) {
    const shadowBias = usePresetStore(state => state["shadow bias"])

    const guiName = `Light.${name}`

    const directionalLight = useControls('Light', {
        [name]: folder({
            color: buildFlexGuiItem<string>(`${guiName}.color`),
            intensity: {
                ...buildFlexGuiItem<number>(`${guiName}.intensity`),
                min: 0,
                max: 10
            },
            position: buildFlexGuiItem<[number, number, number]>(`${guiName}.position`),
            castShadow: buildFlexGuiItem<boolean>(`${guiName}.castShadow`),
            select: button(() => useGlobalStore.setState({ selectedName: `${guiName}.position` })),
            delete: button(() => usePresetStore.setState(({ Light }) => {
                delete Light[name]
                return { Light: { ...Light } }
            }))
        })
    })
    return (
        <>
            <directionalLight castShadow={directionalLight.castShadow} name={`${guiName}.position`} 
            color={directionalLight.color} position={directionalLight.position} intensity={directionalLight.intensity}
            shadow-mapSize={[1024, 1024]} shadow-bias={shadowBias}>
                <orthographicCamera attach="shadow-camera" args={[-20, 20, 25, -20, 0.1, 80]} />
            </directionalLight>
        </>
    );
}

export default DirectionalLight;