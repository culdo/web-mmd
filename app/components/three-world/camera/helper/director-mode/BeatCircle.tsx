import { useSpring, animated } from "@react-spring/three";
import { Text } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { DoubleSide, Group } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useDirector } from "./Director";

type Props = {
    theta: number,
    phi: number,
    text: string,
    color?: string
}

function BeatCircle({ text, theta, phi, color = "aqua" }: Props) {
    const { showBeat, deltaSpherical } = useDirector()

    const camera = useThree(state => state.camera)

    const groupRef = useRef<Group>()

    const props = useSpring({
        from: {
            scale: 1.0,
            opacity: 0.0
        },
        to: {
            scale: 0.5,
            opacity: 0.2
        },
        loop: true
    })

    useEffect(() => {
        const onKeydown = (e: KeyboardEvent) => {
            if (e.key != text) return
            deltaSpherical.theta = theta * Math.PI / 180
            deltaSpherical.phi = phi * Math.PI / 180
        }

        document.addEventListener("keydown", onKeydown)
        return () => {
            document.removeEventListener("keydown", onKeydown)
        }
    }, [])

    useFrame(() => {
        if (!showBeat) return
        groupRef.current.lookAt(camera.position)
    })

    return (
        <>
            {
                showBeat &&
                <group ref={groupRef}>
                    <Text position={[0, 0, 0.01]}>
                        {text}
                    </Text>
                    <animated.mesh scale={props.scale}>
                        <animated.meshBasicMaterial depthWrite={false} side={DoubleSide} color={color} opacity={props.opacity} transparent />
                        <ringGeometry args={[1.0, 2.0]} />
                    </animated.mesh>

                    <mesh>
                        <meshBasicMaterial depthWrite={false} side={DoubleSide} color={color} opacity={0.5} transparent />
                        <circleGeometry args={[1.0]} />
                    </mesh>
                </group>
            }
        </>
    );
}

export default BeatCircle;