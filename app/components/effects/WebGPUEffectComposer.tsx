import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useState } from "react"
import { pass } from "three/tsl"
import { PostProcessing, WebGPURenderer } from "three/webgpu"

function WebGPUEffectComposer() {
    const renderer = useThree(state => state.gl) as unknown as WebGPURenderer
    const scene = useThree(state => state.scene)
    const camera = useThree(state => state.camera)

    const [postProcessing, setPostProcessing] = useState<PostProcessing>()
    useEffect(() => {
        const postProcessing = new PostProcessing(renderer);
        const scenePass = pass(scene, camera);
        postProcessing.outputNode = scenePass

        setPostProcessing(postProcessing)
        return () => {
            setPostProcessing(null)
            scenePass.dispose()
            postProcessing.dispose()
        }
    }, [camera])
    useFrame(() => {
        if (postProcessing) {
            postProcessing.render()
        } else {
            renderer.render(scene, camera)
        }
    }, 3)

    return <></>;
}

export default WebGPUEffectComposer;