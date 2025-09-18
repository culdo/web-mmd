import { Html } from "@react-three/drei";
import { button, useControls } from "leva";
import styles from "./styles.module.css"
import useGlobalStore from "@/app/stores/useGlobalStore";

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

    useControls("Credits", () => ({
        show: button(() => {
            useGlobalStore.setState({ creditsPose: {
                position: [0, 10, 10],
                rotation: [0, 0, 0]
            } })
        })
    }), { order: 1000, collapsed: true })

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