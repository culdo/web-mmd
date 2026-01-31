import { useContext } from "react";
import { EffectComposerContext } from "./WebGPUEffectComposer";

function withScenePass<T>(Component: React.ComponentType<T>) {
    return function Wrapper (props: T) {
        const { scenePass } = useContext(EffectComposerContext)
        if(!scenePass) return null
        return <Component {...props}></Component>
    }
}


export default withScenePass;