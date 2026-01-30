import { outlinePass } from "@/app/modules/effects/webgpu/OutlinePassNode"
import usePresetStore from "@/app/stores/usePresetStore"
import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useState } from "react"
import { pass } from "three/tsl"
import { NoToneMapping, PostProcessing, WebGPURenderer } from "three/webgpu"

function WebGPUEffectComposer() {
    const renderer = useThree(state => state.gl) as unknown as WebGPURenderer
    const scene = useThree(state => state.scene)
    const camera = useThree(state => state.camera)
    const showOutline = usePresetStore(state => state["show outline"])

    const [postProcessing, setPostProcessing] = useState<PostProcessing>()

    // Disable tone mapping because threejs disallows tonemapping on render targets
    useEffect(() => {
        const currentTonemapping = renderer.toneMapping
        renderer.toneMapping = NoToneMapping
        return () => {
            renderer.toneMapping = currentTonemapping
        }
    }, [renderer])

    useEffect(() => {
        const postProcessing = new PostProcessing(renderer);
        const scenePass = showOutline ? outlinePass(scene, camera) : pass(scene, camera);

        postProcessing.outputNode = scenePass

        setPostProcessing(postProcessing)
        return () => {
            setPostProcessing(null)
            scenePass.dispose()
            postProcessing.dispose()
        }
    }, [camera, showOutline])
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