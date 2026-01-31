import { useContext, useEffect, useMemo } from "react";
import { EffectComposerContext } from "./WebGPUEffectComposer";
import { bloom } from "three/examples/jsm/tsl/display/BloomNode.js";
import withScenePass from "./utils";

function BloomNode({ strength, radius, threshold }: { strength?: number, radius?: number, threshold?: number }) {
    const { scenePass } = useContext(EffectComposerContext)
    const bloomPass = useMemo(() => {
        const bloomPass = bloom(scenePass)
        return bloomPass
    }, [])
    
    useEffect(() => {
        bloomPass.strength.value = strength
        bloomPass.radius.value = radius
        bloomPass.threshold.value = threshold
    }, [bloomPass, strength, radius, threshold])
    useEffect(() => () => {
        bloomPass.dispose()
    }, [bloomPass])
    return <primitive object={bloomPass} dispose={null} />;
}

export default withScenePass(BloomNode);