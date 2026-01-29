import { Html } from "@react-three/drei";
import { button, useControls } from "leva";
import styles from "./styles.module.css"
import useGlobalStore from "@/app/stores/useGlobalStore";
import { useThree } from "@react-three/fiber";
import { Euler, PerspectiveCamera, Vector3 } from "three";

function Credit({ color = "#ffd9aaff", children }: { children: React.ReactNode, color?: string }) {
    return (
        <h1 style={{
            fontSize: "30px",
            fontStyle: "italic",
            fontWeight: "bold",
            color: color,
            marginBlock: "10px"
        }}>{children}</h1>
    );
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
            // trigger renderering on same position
            camera.position.z += 0.001
            setTimeout(() => {
                camera.position.set(0, 10, 30)
                camera.fov = 30
                camera.lookAt(creditsPose.position)
            }, 100)
        })
    }), { order: 1000, collapsed: true }, [camera])

    return (creditsPose &&
        <Html
            position={creditsPose.position}
            rotation={creditsPose.rotation}
            zIndexRange={[100, 0]}
            transform
            occlude="blending"
        >
            <div className={styles.credits}
                onClick={() => {
                    useGlobalStore.setState({ creditsPose: null })
                }}
            >
                <Credit color="#bffd73ff">Player mode</Credit>
                <Credit>Music</Credit>
                <h1>GimmexGimme by 八王子P × Giga</h1>
                <Credit>Model</Credit>
                <h1>つみ式みくさんv4 by つみだんご</h1>
                <Credit>Motion</Credit>
                <h1>ぎみぎみ（みっちゃん）_原曲音源 by シガー</h1>
                <Credit>Emotion</Credit>
                <h1>GimmeGimmeリップ表情v07 by ノン</h1>
                <Credit>Camera</Credit>
                <h1>Gimme x Gimme镜头 by 冬菇</h1>
                <Credit>Stage</Credit>
                <h1>RedialC_EpRoomDS by RedialC</h1>
                <Credit color="#bffd73ff">Game mode</Credit>
                <Credit>Motions</Credit>
                <h1>移動モーション v1.3、ぼんやり待ちループ by むつごろう</h1>
            </div>
        </Html>
    );
}

export default CreditsList;