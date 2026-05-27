import { Billboard, Text, BillboardProps } from "@react-three/drei";
import { button, useControls } from "leva";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, Group, Color, Vector3 } from "three";
import { useRef, useState, useEffect, forwardRef, useCallback } from "react";
import { buildGuiItem } from "@/app/utils/gui";
import usePresetStore from "@/app/stores/usePresetStore";
import { RunModes } from "../run-modes";


const Word = forwardRef<Group, { children: React.ReactNode, colorRef: React.RefObject<any> } & BillboardProps>(({ children, onClick, colorRef, ...props }, ref) => {
    const fontProps = { fontSize: 1, fontWeight: 900, letterSpacing: -0.05, lineHeight: 1.2, 'material-toneMapped': false, textAlign: "center" as const, outlineWidth: 0.02, outlineColor: "#000000" }
    const [hovered, setHovered] = useState(false)
    const over = (e: React.MouseEvent<HTMLDivElement>) => (e.stopPropagation(), setHovered(true))
    const out = () => setHovered(false)
    useEffect(() => {
        if (hovered) {
            const origColor = colorRef.current.getHex()
            document.body.style.cursor = 'pointer'
            colorRef.current.offsetHSL(0, 0, -0.1)
            return () => {
                document.body.style.cursor = 'auto'
                colorRef.current?.set(origColor)
            }
        }
    }, [hovered])
    return (
        <Billboard {...props} ref={ref}>
            <Text color={colorRef.current} material-depthTest={false} onPointerOver={over} onPointerOut={out} onClick={onClick} {...fontProps}>
                {children}
            </Text>
        </Billboard>
    )
})

function CreditsList() {
    const camera = useThree(state => state.camera) as PerspectiveCamera
    const creditsRef = useRef<Group>(null)
    const colorRef = useRef(new Color(0xffffff))
    const player = useGlobalStore(state => state.player)
    const runMode = usePresetStore(state => state["run mode"])
    const cameraDirection = useRef(new Vector3())

    const showCredits = useCallback(() => {
        creditsRef.current.visible = true
        creditsRef.current.position.copy(camera.position)
        creditsRef.current.quaternion.copy(camera.quaternion)
        camera.getWorldDirection(cameraDirection.current)
        cameraDirection.current.multiplyScalar(1500 / camera.fov)
        creditsRef.current.position.add(cameraDirection.current)
    }, [camera])

    const [{ text }, _] = useControls("Credits", () => ({
        text: {
            ...buildGuiItem("creditsText"),
            rows: true
        },
        color: {
            ...buildGuiItem("creditsColor"),
            onChange: (val, path, options) => {
                colorRef.current?.set(val)
            }
        },
        show: button(showCredits)
    }), { order: 1000, collapsed: true }, [camera])

    useEffect(() => {
        const onPlay = () => {
            creditsRef.current.visible = false
        }
        const onPause = () => {
            if (player.currentTime > player.duration - 5) {
                showCredits()
            }
        }
        player?.addEventListener("play", onPlay)
        player?.addEventListener("seeked", onPlay)
        player?.addEventListener("pause", onPause)
        return () => {
            player?.removeEventListener("play", onPlay)
            player?.removeEventListener("seeked", onPlay)
            player?.removeEventListener("pause", onPause)
        }
    }, [player, showCredits])

    return (
        <Word
            ref={(obj) => {
                if (!obj) return
                creditsRef.current = obj
                useGlobalStore.setState({ creditsList: obj })
            }}
            visible={false}
            colorRef={colorRef}
            onClick={() => {
                creditsRef.current.visible = false
            }}
        >
            {runMode == RunModes.GAME_MODE ? "-- Game mode --\nModel\n( same as in player mode )\nStage\n( same as in player mode )\nMotions\n移動モーション v1.3、ぼんやり待ちループ by むつごろう" : text}
        </Word>
    );
}

export default CreditsList;