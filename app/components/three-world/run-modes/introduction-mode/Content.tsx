import useGlobalStore from "@/app/stores/useGlobalStore"
import { useThree } from "@react-three/fiber"
import { useControls } from "leva"
import { useRef, useEffect } from "react"
import { Vector3, Quaternion, PerspectiveCamera } from "three"
import Section from "./sections/Section"
import { Text } from "@react-three/drei";
import ContentContext from "./context"

function Content() {
    const { color } = useControls("Introduction", {
        color: "#007590"
    })

    const player = useGlobalStore(state => state.player)
    const _v = useRef(new Vector3()).current
    const _v2 = useRef(new Vector3()).current
    const camRot = useRef(new Quaternion()).current
    const camera = useThree(state => state.camera) as PerspectiveCamera
    useEffect(() => {
        if (!player || !camera) return
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

            _v.subVectors(camera.position, target.position)
            _v2.set(1, 0, 0).applyQuaternion(camRot)
            _v.applyAxisAngle(_v2, yWeight)
            _v2.set(0, 1, 0).applyQuaternion(camRot)
            _v.applyAxisAngle(_v2, xWeight)
            _v.add(target.position)
            camera.position.copy(_v)
            
            camera.up.copy(_v2)
            camera.lookAt(target.position)
        }

        const onPlay = () => {
            const scrollDown = document.getElementById("intro-sections")
            scrollDown.style.display = "none"
        }

        const onPause = () => {
            const scrollDown = document.getElementById("intro-sections")
            scrollDown.style.display = "flex"
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
    }, [player, camera])
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
                    MikuMikuDance(MMD) is a free 3D software for making high-quality Dancing MV.
                </Text>
                <Text position={[0, -1.5, 0]} fontSize={0.3} color={color}>
                    The original Windows version and specifications was developed by 樋口優.
                </Text>
                <Text position={[0, -2, 0]} fontSize={0.3} color={color}>
                    And has been ported to other platforms since release.
                </Text>
                <Text position={[0, -3, 0]} fontSize={0.3} color={color}>
                    Web MMD is based on the Three.js MMD libs developed by takahirox.
                </Text>
                <Text position={[0, -3.5, 0]} fontSize={0.3} color={color}>
                    It has many new features and fixes.
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
                    It has the materials info divided into the following sections!
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
                    You can download the Character, Stage model from MMD resource share sites.
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
                    You can download the Dancing, Emotion and Camera motions from MMD resource share sites.
                </Text>
                <Text position={[0, -2, 0]} fontSize={0.3} color={color}>
                    Like bowlroll.net or 3d.nicovideo.jp!
                </Text>
            </Section>
        </ContentContext.Provider>
    )
}

export default Content
