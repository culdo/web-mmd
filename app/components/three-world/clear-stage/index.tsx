import usePresetStore from "@/app/stores/usePresetStore";
import WithReady from "@/app/stores/WithReady";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { Color } from "three";

function ClearStage() {
    const scene = useThree(state => state.scene)

    useEffect(() => {
        const prevBg = scene.background
        const prevFogColor = usePresetStore.getState()["fog color"]

        const bgColor = "#caf9ff"

        scene.background = new Color(bgColor)
        usePresetStore.setState({ "fog color": bgColor })
        return () => {
            scene.background = prevBg
            usePresetStore.setState({ "fog color": prevFogColor })
        }
    }, [])

    return (
        <mesh name="stage" rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[10000, 10000]}></planeGeometry>
            <meshStandardMaterial color={0xb6f6ff} depthWrite={false} />
        </mesh>
    );
}

export default WithReady(ClearStage);