import { useContext, useEffect, useMemo } from "react";
import { EffectComposerContext } from "./WebGPUEffectComposer";
import { pass } from "three/tsl";

function PassNode() {
    const { scene, camera, setScenePass } = useContext(EffectComposerContext)
    const node = useMemo(() => pass(scene, camera), [scene, camera])
    useEffect(() => {
        setScenePass(node)
    }, [node])
    useEffect(() => () => {
        node.dispose()
    }, [node])
    return <primitive object={node} dispose={null} />;
}

export default PassNode;