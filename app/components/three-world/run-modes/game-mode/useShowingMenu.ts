import useGlobalStore from "@/app/stores/useGlobalStore"
import { useFrame } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { Material } from "three"

function useMenuTransit() {
    const { stage } = useGlobalStore(state => state.models)
    const showGameMenu = useGlobalStore(state => state.showGameMenu)
    const isTransit = useRef(false)

    useEffect(() => {
        isTransit.current = true
    }, [showGameMenu])

    useEffect(() => {
        return () => {
            for (const material of stage.material as Material[]) {
                material.opacity = 1.0
            }
        }
    }, [])

    useFrame((_, delta) => {
        if (!stage || !isTransit.current) return
        const opacityDelta = showGameMenu ? -2 : 2
        for (const material of stage.material as Material[]) {
            material.opacity += opacityDelta * delta
            if (material.opacity > 1) {
                material.opacity = 1
                isTransit.current = false
            }
            if (material.opacity < 0) {
                material.opacity = 0
                isTransit.current = false
            }
        }
    })
}

export default useMenuTransit;