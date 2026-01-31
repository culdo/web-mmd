import { useContext, useEffect, useMemo, useRef } from "react";
import { EffectComposerContext } from "./WebGPUEffectComposer";
import withScenePass from "./utils";
import { dof } from "three/examples/jsm/tsl/display/DepthOfFieldNode.js";
import { uniform } from "three/tsl";

const dofConfig = {
    focusDistance: uniform(500),
    focalLength: uniform(200),
    bokehScale: uniform(10)
}

function DofNode({ focusDistance, focalLength, bokehScale }: { focusDistance?: number, focalLength?: number, bokehScale?: number }) {
    const { scenePass } = useContext(EffectComposerContext)
    const dofPass = useMemo(() => {
        const pass = dof(scenePass, scenePass.getViewZNode(), dofConfig.focusDistance, dofConfig.focalLength, dofConfig.bokehScale)
        return pass
    }, [])
    useEffect(() => {
        dofConfig.focusDistance.value = focusDistance
        dofConfig.focalLength.value = focalLength
        dofConfig.bokehScale.value = bokehScale
    }, [focusDistance, focalLength, bokehScale])
    useEffect(() => () => {
        dofPass.dispose()
    }, [dofPass])
    return <primitive object={dofPass} dispose={null} />;
}

export default withScenePass(DofNode);