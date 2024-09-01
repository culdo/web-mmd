import useGlobalStore from "@/app/stores/useGlobalStore"
import usePresetStore from "@/app/stores/usePresetStore"
import { buildFlexGuiItem } from "@/app/utils/gui"
import { button, folder, useControls } from "leva"

function PointLight({ name }: { name?: string }) {
    const presetReady = useGlobalStore(state => state.presetReady)

    const guiName = `Light.${name}`

    const pointLight = useControls('Light', {
        [name]: folder({
            color: buildFlexGuiItem<string>(`${guiName}.color`),
            intensity: {
                ...buildFlexGuiItem<number>(`${guiName}.intensity`),
                min: 0,
                max: 10
            },
            position: buildFlexGuiItem<[number, number, number]>(`${guiName}.position`),
            select: button(() => useGlobalStore.setState({ selectedName: `${guiName}.position` })),
            delete: button(() => usePresetStore.setState(({ Light }) => {
                delete Light[name]
                return { Light: { ...Light } }
            }))
        })
    }, [presetReady])
    return (
        <>
            <pointLight name={`${guiName}.position`} color={pointLight.color} position={pointLight.position} intensity={pointLight.intensity} />
        </>
    );
}

export default PointLight;