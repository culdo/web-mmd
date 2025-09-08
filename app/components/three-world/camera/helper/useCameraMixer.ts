import { useEffect } from "react"
import { AnimationMixer, PerspectiveCamera } from "three"

function useClearMixer(cameraMixer: AnimationMixer) {
    const camera = cameraMixer.getRoot() as PerspectiveCamera
    useEffect(() => {
        const pos = camera.position.clone()
        const rot = camera.rotation.clone()
        const fov = camera.fov
        return () => {
            cameraMixer.stopAllAction()
            cameraMixer.uncacheRoot(camera)
            camera.position.copy(pos)
            camera.rotation.copy(rot)
            camera.fov = fov
            camera.updateProjectionMatrix()
        }
    }, [cameraMixer])
}

export default useClearMixer;