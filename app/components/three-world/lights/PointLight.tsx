import useGlobalStore from "@/app/stores/useGlobalStore"
import usePresetStore from "@/app/stores/usePresetStore"
import { buildFlexGuiItem } from "@/app/utils/gui"
import { Sphere } from "@react-three/drei"
import { button, folder, useControls } from "leva"

function PointLight({ name }: { name?: string }) {
    const guiName = `Light.${name}`

    const pointLight = useControls('Light', {
        [name]: folder({
            color: buildFlexGuiItem<string>(`${guiName}.color`),
            intensity: {
                ...buildFlexGuiItem<number>(`${guiName}.intensity`),
                min: 0,
                max: 10
            },
            visible: {
                value: false
            },
            position: buildFlexGuiItem<[number, number, number]>(`${guiName}.position`),
            select: button(() => useGlobalStore.setState({ selectedName: `${guiName}.position` })),
            delete: button(() => usePresetStore.setState(({ Light }) => {
                delete Light[name]
                return { Light: { ...Light } }
            }))
        })
    })
    return (
        <>
            <pointLight name={`${guiName}.position`} color={pointLight.color} position={pointLight.position} intensity={pointLight.intensity}>
                {
                    pointLight.visible &&
                    <Sphere scale={0.2}>
                        <meshStandardMaterial emissive={pointLight.color} emissiveIntensity={1.0} color={pointLight.color} />
                    </Sphere>
                }
            </pointLight>
        </>
    );
}

export default PointLight;