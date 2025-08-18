import { Html } from "@react-three/drei";
import { button, useControls } from "leva";
import styles from "./styles.module.css"
import useGlobalStore from "@/app/stores/useGlobalStore";

function Credit({ children }: { children: React.ReactNode }) {
    return (
        <h1 style={{
            fontSize: "30px",
            fontStyle: "italic",
            fontWeight: "bold",
            color: "#ffd9aaff"
        }}>{children}</h1>
    );
}

function CreditsList() {
    const isShow = useGlobalStore((state) => state.showCredits)

    useControls("Credits", () => ({
        show: button(() => useGlobalStore.setState({ showCredits: true }))
    }), { order: 1000, collapsed: true })

    return (isShow &&
        <Html
            position={[0, 10, 10]}
            transform
        >
            <div className={styles.credits}
                onClick={() => {
                    useGlobalStore.setState({ showCredits: false })
                }}
            >
                <Credit>Music</Credit>
                <h1>GimmexGimme by 八王子P × Giga</h1>
                <br />
                <Credit>Model</Credit>
                <h1>つみ式みくさんv4 by つみだんご</h1>
                <br />
                <Credit>Motion</Credit>
                <h1>ぎみぎみ（みっちゃん）_原曲音源 by シガー</h1>
                <br />
                <Credit>Emotion</Credit>
                <h1>GimmeGimmeリップ表情v07 by ノン</h1>
                <br />
                <Credit>Camera</Credit>
                <h1>Gimme x Gimme镜头 by 冬菇</h1>
                <br />
                <Credit>Stage</Credit>
                <h1>RedialC_EpRoomDS by RedialC</h1>
                <br />
            </div>
        </Html>
    );
}

export default CreditsList;