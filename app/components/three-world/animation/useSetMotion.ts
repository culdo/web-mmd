import useGlobalStore from "@/app/stores/useGlobalStore"
import { useFrame } from "@react-three/fiber"
import { useRef, useCallback, useEffect } from "react"

/**
 * A hook for one-time motion setting.
 * @returns 
 */
function useSetMotion() {
    const player = useGlobalStore(state => state.player)
    const isSetMotionRef = useRef(true)

    const setMotion = useCallback(() => {
        isSetMotionRef.current = true
    }, [])
    
    useEffect(() => {
        player.addEventListener("play", setMotion)
        player.addEventListener("seeked", setMotion)
        return () => {
            player.removeEventListener("play", setMotion)
            player.removeEventListener("seeked", setMotion)
        }
    }, [setMotion])

    return isSetMotionRef;
}

export default useSetMotion;