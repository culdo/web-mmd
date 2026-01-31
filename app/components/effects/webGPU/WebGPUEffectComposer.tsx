import { Instance, useFrame, useThree } from "@react-three/fiber"
import { createContext, Dispatch, SetStateAction, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import BloomNode from "three/examples/jsm/tsl/display/BloomNode.js"
import DepthOfFieldNode from "three/examples/jsm/tsl/display/DepthOfFieldNode.js"
import { convertToTexture } from "three/tsl"
import { Camera, Group, NoToneMapping, PassNode, PostProcessing, Scene, WebGPURenderer } from "three/webgpu"

export const EffectComposerContext = /* @__PURE__ */ createContext<{
    postProcessing: PostProcessing
    camera: Camera
    scene: Scene
    scenePass: PassNode;
    setScenePass: Dispatch<SetStateAction<PassNode>>;
}>(null!)

export type EffectComposerProps = {
    children: JSX.Element | JSX.Element[]
}

function WebGPUEffectComposer({ children }: EffectComposerProps) {
    const renderer = useThree(state => state.gl) as unknown as WebGPURenderer
    const scene = useThree(state => state.scene)
    const camera = useThree(state => state.camera)

    // Disable tone mapping because threejs disallows tonemapping on render targets
    useEffect(() => {
        const currentTonemapping = renderer.toneMapping
        renderer.toneMapping = NoToneMapping
        return () => {
            renderer.toneMapping = currentTonemapping
        }
    }, [renderer])

    const postProcessing = useMemo(() => {
        return new PostProcessing(renderer)
    }, [renderer])

    useEffect(() => () => postProcessing.dispose(), [postProcessing])

    useFrame(() => {
        if (!postProcessing) return
        postProcessing.render()
    }, 3)

    const group = useRef<Group>(null!)
    useLayoutEffect(() => {
        const groupInstance = (group.current as Group & { __r3f: Instance<Group> }).__r3f
        if (groupInstance && postProcessing) {
            const children = groupInstance.children

            const childrens = children instanceof Array ? children : [children]
            const scenePass = childrens[0].object;
            let prevNode: PassNode = scenePass;
            for (let i = 0; i < childrens.length; i++) {
                const node = childrens[i].object
                if (i > 0) {
                    let outputNode = node
                    if (node instanceof BloomNode) {
                        node.inputNode = prevNode
                        node.needsUpdate = true
                        outputNode = prevNode.add(node)
                    } else if (node instanceof DepthOfFieldNode) {
                        node.textureNode = convertToTexture(prevNode)
                        node.viewZNode = prevNode.getViewZNode()
                        node.needsUpdate = true
                    }
                    prevNode = outputNode
                }
                // last node is output node
                if (i == childrens.length - 1) {
                    postProcessing.outputNode = prevNode
                    postProcessing.needsUpdate = true
                }
            }
        }
    }, [children])

    const [scenePass, setScenePass] = useState<PassNode>()
    // Memoize state, otherwise it would trigger all consumers on every render
    const state = useMemo(
        () => ({ postProcessing, camera, scene, scenePass, setScenePass }),
        [postProcessing, camera, scene, scenePass, setScenePass]
    )

    return (
        <EffectComposerContext.Provider value={state}>
            <group ref={group}>
                {children}
            </group>
        </EffectComposerContext.Provider>
    );
}

export default WebGPUEffectComposer;