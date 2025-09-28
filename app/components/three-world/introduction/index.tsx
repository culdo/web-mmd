import { Text } from "@react-three/drei";
import { useControls } from "leva";
import ClearStage from "../clear-stage";
import { createContext, MutableRefObject, useContext, useEffect, useRef } from "react";
import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { useFrame, useThree } from "@react-three/fiber";
import { Group, Quaternion, Spherical, Vector2, Vector3 } from "three";
import { OrbitControls } from "three-stdlib";
import { PerspectiveCamera } from "three";

const ContentContext = createContext<{
    sectionTimesRef?: MutableRefObject<number[]>
    camRot?: Quaternion
}>({})

function Section({ start, end, position = [0, 0, 0], children }: { start: number, end: number, position?: [number, number, number], children: React.ReactNode }) {
    const player = useGlobalStore(state => state.player)
    const groupRef = useRef<Group>()
    const isPlayedRef = useRef(false)
    const { sectionTimesRef, camRot } = useContext(ContentContext)
    const camera = useThree(state => state.camera)
    const _v = useRef(new Vector3()).current

    useEffect(() => {
        sectionTimesRef.current.push(start)
    }, [])
    useFrame(() => {
        if (!player) return
        if (start <= player.currentTime && player.currentTime < end) {
            groupRef.current.visible = true
            if (end - player.currentTime < 1.0) {
                player.volume = end - player.currentTime
            }
            if (player.currentTime - start < 1.0) {
                player.volume = player.currentTime - start
            }
            if (!isPlayedRef.current) {
                const target = camera.getObjectByName("target")
                _v.subVectors(target.position, camera.position).normalize()
                _v.multiplyScalar(30)
                _v.add(camera.position)
                groupRef.current.position.copy(_v)
                groupRef.current.position.add(_v.fromArray(position).applyQuaternion(camera.quaternion))
                groupRef.current.quaternion.set(0, 0, 0, 1).multiply(camera.quaternion)
                camRot.copy(camera.quaternion)
            }
            isPlayedRef.current = true
        } else {
            if (isPlayedRef.current) {
                if (!player.paused) {
                    player.api.pauseVideo()
                    player.currentTime = end
                }
                isPlayedRef.current = false
            }
            groupRef.current.visible = false
        }
    }, 4)

    return (
        <group ref={groupRef}>
            {children}
        </group>
    );
}

function Content() {
    const { color } = useControls("Intro", {
        color: "#007590"
    })

    const player = useGlobalStore(state => state.player)
    const spherical = useRef(new Spherical()).current
    const _v = useRef(new Vector3()).current
    const _zeroV = useRef(new Vector2()).current
    const _screenV = useRef(new Vector2()).current
    const camRot = useRef(new Quaternion()).current
    const _q = useRef(new Quaternion()).current
    const camera = useThree(state => state.camera) as PerspectiveCamera
    useEffect(() => {
        if (!player) return
        const onWheel = (e: WheelEvent) => {
            if (e.deltaY > 0) {
                if (player.paused) {
                    player.play()
                } else {
                    player.api.pauseVideo()
                    let minNextTime = player.duration
                    for (const time of sectionTimesRef.current) {
                        if (time > player.currentTime && time < minNextTime) {
                            minNextTime = time
                        }
                    }
                    player.currentTime = minNextTime
                }
            } else {
                if (!player.paused) {
                    player.api.pauseVideo()
                } else {
                    let maxPrevTime = 0
                    for (const time of sectionTimesRef.current) {
                        if (time < player.currentTime && time > maxPrevTime) {
                            maxPrevTime = time
                        }
                    }
                    player.currentTime = maxPrevTime
                }
            }
        }
        const onMousemove = (e: MouseEvent) => {
            if (!player?.paused) return
            const xWeight = e.movementX / window.innerWidth * Math.PI * 0.25
            const yWeight = e.movementY / window.innerHeight * Math.PI * 0.25
            const target = camera.getObjectByName("target")
            _v.subVectors(target.position, camera.position).normalize()
            _v.multiplyScalar(30)
            _v.add(camera.position)
            target.position.copy(_v)

            const screenAngle = _q.angleTo(camRot)
            _v.subVectors(camera.position, target.position)
            spherical.setFromVector3(_v)
            _screenV.set(xWeight, yWeight).rotateAround(_zeroV, screenAngle)
            spherical.theta += _screenV.x
            spherical.phi += _screenV.y
            _v.setFromSpherical(spherical)
            _v.add(target.position)
            camera.position.copy(_v)
            camera.up.set(0, 1, 0).applyQuaternion(camRot)

            camera.lookAt(target.position)
        }

        const onPlay = () => {
            const scrollDown = document.getElementById("scroll-down")
            scrollDown.style.display = "none"
        }

        const onPause = () => {
            const scrollDown = document.getElementById("scroll-down")
            scrollDown.style.display = "block"
        }

        player.addEventListener("play", onPlay)
        player.addEventListener("pause", onPause)
        document.addEventListener("wheel", onWheel)
        document.addEventListener("mousemove", onMousemove)
        return () => {
            player.removeEventListener("play", onPlay)
            player.removeEventListener("pause", onPause)
            document.removeEventListener("wheel", onWheel)
            document.removeEventListener("mousemove", onMousemove)
        }
    }, [player])
    const sectionTimesRef = useRef<number[]>([])
    return (
        <ContentContext.Provider value={{ sectionTimesRef, camRot }}>
            <Section start={0} end={20.24} position={[-10, 5, 0]}>
                <Text position={[0, 0, 0]} fontWeight={"bold"} color={color}>
                    Web MMD
                </Text>
                <Text position={[0, -1, 0]} fontSize={0.3} color={color}>
                    A Cross-Platform MMD Player
                </Text>
            </Section>
            <Section start={20.24} end={31.51} position={[5, 2, 0]}>
                <Text position={[0, 0, 0]} fontWeight={"bold"} color={color}>
                    What is MMD?
                </Text>
                <Text position={[0, -1, 0]} fontSize={0.3} color={color}>
                    MikuMikuDance(MMD) is a highly-complete free 3D software for making Dancing MV.
                </Text>
                <Text position={[0, -1.5, 0]} fontSize={0.3} color={color}>
                    The original Windows version and specifications was developed by 樋口優.
                </Text>
                <Text position={[0, -2, 0]} fontSize={0.3} color={color}>
                    And laterly be ported to other platforms.
                </Text>
                <Text position={[0, -3, 0]} fontSize={0.3} color={color}>
                    Web MMD is based on the Three.js MMD libs developed by takahirox.
                </Text>
                <Text position={[0, -3.5, 0]} fontSize={0.3} color={color}>
                    With many new features and fixes.
                </Text>
            </Section>
            <Section start={31.51} end={40} position={[8, 4, 0]}>
                <Text position={[0, 0, 0]} fontWeight={"bold"} color={color}>
                    How to make a Web MMD like this?
                </Text>
                <Text position={[0, -1, 0]} fontSize={0.3} color={color}>
                    Search and find a MMD video you like from the web!
                </Text>
                <Text position={[0, -2, 0]} fontSize={0.3} color={color}>
                    Then in the video description or in the video you can find the Credits List.
                </Text>
                <Text position={[0, -3, 0]} fontSize={0.3} color={color}>
                    The Credits List has the info of each parts. Check the following sections!
                </Text>
            </Section>
            <Section start={40} end={57.50} position={[-10, 0, 0]}>
                <Text position={[0, 0, 0]} fontWeight={"bold"} color={color}>
                    Music
                </Text>
                <Text position={[0, -1, 0]} fontSize={0.3} color={color}>
                    You can choose a music from YT!
                </Text>

            </Section>
            <Section start={57.50} end={60} position={[2, 2.5, -3]}>
                <Text position={[0, 0, 0]} fontWeight={"bold"} color={color}>
                    Models
                </Text>
                <Text position={[0, -1, 0]} fontSize={0.3} color={color}>
                    You can download the Character, Stage model from MMD resource share sites,
                </Text>
                <Text position={[0, -2, 0]} fontSize={0.3} color={color}>
                    Like bowlroll.net or 3d.nicovideo.jp!
                </Text>
            </Section>
            <Section start={60} end={70} position={[10, 0, 0]}>
                <Text position={[0, 0, 0]} fontWeight={"bold"} color={color}>
                    Motions
                </Text>
                <Text position={[0, -1, 0]} fontSize={0.3} color={color}>
                    You can download the Dancing, Emotion and Camera motions from MMD resource share sites,
                </Text>
                <Text position={[0, -2, 0]} fontSize={0.3} color={color}>
                    Like bowlroll.net or 3d.nicovideo.jp!
                </Text>
            </Section>
        </ContentContext.Provider>
    )
}

function Scene() {
    const models = useGlobalStore(state => state.models)
    const controls = useThree(state => state.controls) as OrbitControls
    useEffect(() => {
        if (models.stage) {
            const {
                "bloom enabled": prevBloomEnabled,
                "Ambient intensity": prevAmbientIntensity,
                "auto hide GUI": prevAutoHideGui
            } = usePresetStore.getState()

            models.stage.visible = false
            controls.enabled = false
            document.getElementById("rawPlayer").style.display = "none"
            document.getElementById("scroll-down").style.display = "block"
            useGlobalStore.setState({ gui: { hidden: true } })
            usePresetStore.setState({
                "auto hide GUI": false,
                "bloom enabled": false,
                "Ambient intensity": 0.5
            })

            return () => {
                models.stage.visible = true
                controls.enabled = true
                document.getElementById("rawPlayer").style.display = "block"
                document.getElementById("scroll-down").style.display = "none"
                useGlobalStore.setState({ gui: { hidden: false } })
                usePresetStore.setState({
                    "auto hide GUI": prevAutoHideGui,
                    "bloom enabled": prevBloomEnabled,
                    "Ambient intensity": prevAmbientIntensity
                })

            }
        }
    }, [models.stage])
    return (
        <>
            <ClearStage />
            <Content />
        </>
    );
}

function Introduction() {
    const { enabled } = useControls("Introduction", {
        enabled: false
    }, { order: 5 })
    return enabled && <Scene></Scene>;
}

export default Introduction;

