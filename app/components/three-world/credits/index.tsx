import { Billboard, Html, Text, BillboardProps } from "@react-three/drei";
import { button, useControls } from "leva";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { useThree } from "@react-three/fiber";
import { Euler, PerspectiveCamera, Vector3, Color } from "three";
import { useRef, useState, useEffect } from "react";


function Word({ children, ...props }: { children: React.ReactNode } & BillboardProps) {
    const fontProps = { fontSize: 1, letterSpacing: -0.05, lineHeight: 1.2, 'material-toneMapped': false, textAlign: "center" as const }
    const ref = useRef(null)
    const [hovered, setHovered] = useState(false)
    const over = (e: React.MouseEvent<HTMLDivElement>) => (e.stopPropagation(), setHovered(true))
    const out = () => setHovered(false)
    // Change the mouse cursor on hover¨
    useEffect(() => {
        if (hovered) {
            document.body.style.cursor = 'pointer'
            ref.current.material.color.set('#e8e8e8')
        }
        return () => {
            document.body.style.cursor = 'auto'
            if (ref.current) ref.current.material.color.set('white')
        }
    }, [hovered])
    return (
        <Billboard {...props}>
            <Text ref={ref} onPointerOver={over} onPointerOut={out} onClick={() => {
                useGlobalStore.setState({ creditsPose: null })
            }} {...fontProps}>
                {children}
            </Text>
        </Billboard>
    )
}

function CreditsList() {
    const creditsPose = useGlobalStore((state) => state.creditsPose)
    const camera = useThree(state => state.camera) as PerspectiveCamera

    useControls("Credits", () => ({
        show: button(() => {
            const creditsPose = {
                position: new Vector3(-10, 10, -10),
                rotation: new Euler()
            }
            useGlobalStore.setState({ creditsPose })
            camera.position.set(0, 10, 30)
            camera.fov = 30
            camera.lookAt(creditsPose.position)
            camera.updateProjectionMatrix()
        })
    }), { order: 1000, collapsed: true }, [camera])

    return (creditsPose &&
        <Word
            position={creditsPose.position}
        >
            {
                "-- Player mode --\n" +
                "Music\n" +
                "GimmexGimme by 八王子P × Giga\n" +
                "Model\n" +
                "つみ式みくさんv4 by つみだんご\n" +
                "Motion\n" +
                "ぎみぎみ（みっちゃん）_原曲音源 by シガー\n" +
                "Emotion\n" +
                "GimmeGimmeリップ表情v07 by ノン\n" +
                "Camera\n" +
                "Gimme x Gimme镜头 by 冬菇\n" +
                "Stage\n" +
                "RedialC_EpRoomDS by RedialC\n" +
                "-- Game mode --\n" +
                "Motions\n" +
                "移動モーション v1.3、ぼんやり待ちループ by むつごろう"
            }
        </Word>
    );
}

export default CreditsList;