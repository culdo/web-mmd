import { useContext, useEffect, useMemo } from "react";
import { EffectComposerContext } from "./WebGPUEffectComposer";
import { outlinePass } from "@/app/modules/effects/webgpu/OutlinePassNode";

function OutlineNode() {
    const { scene, camera, setScenePass } = useContext(EffectComposerContext)
    const node = useMemo(() => outlinePass(scene, camera), [scene, camera])
    useEffect(() => {
        setScenePass(node)
    }, [node])
    useEffect(() => () => {
        node.dispose()
    }, [node])
    return <primitive object={node} dispose={null} />;
}

export default OutlineNode;