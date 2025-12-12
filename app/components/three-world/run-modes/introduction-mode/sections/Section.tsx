import useGlobalStore from "@/app/stores/useGlobalStore"
import { useFrame, useThree } from "@react-three/fiber"
import { useContext, useEffect, useRef } from "react"
import { Group, Vector3 } from "three"
import styles from "./styles.module.css"
import ContentContext from "../context"
import usePresetStore from "@/app/stores/usePresetStore"
import { RunModes } from "../.."

function Section({ start, end, position = [0, 0, 0], children }: { start: number, end: number, position?: [number, number, number], children: React.ReactNode }) {
    const player = useGlobalStore(state => state.player)
    const groupRef = useRef<Group>()
    const isPlayedRef = useRef(false)
    const { sectionTimesRef, camRot } = useContext(ContentContext)
    const camera = useThree(state => state.camera)
    const _v = useRef(new Vector3()).current
    const idxRef = useRef(0)
    const navBtRef = useRef<Element>()

    useEffect(() => {
        sectionTimesRef.current.push(start)
        const idx = sectionTimesRef.current.length
        const navBt = document.getElementById(`section${idx}`)
        const onClick = () => {
            player.api.pauseVideo()
            player.currentTime = start
        }
        navBt.addEventListener("click", onClick)
        navBtRef.current = navBt
        idxRef.current = idx

        return () => {
            sectionTimesRef.current = []
            navBt.removeEventListener("click", onClick)
        }
    }, [])

    useEffect(() => {
        const tryNowBt = document.getElementById('tryNow')
        const onClick = () => {
            usePresetStore.setState({ "run mode": RunModes.PLAYER_MODE })
        }
        tryNowBt.addEventListener("click", onClick)

        return () => {
            tryNowBt.removeEventListener("click", onClick)
        }
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
                for (const item of document.querySelectorAll(`.${styles.active}`)) {
                    item.classList.remove(styles.active)
                }
                navBtRef.current.classList.add(styles.active)
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

export default Section
