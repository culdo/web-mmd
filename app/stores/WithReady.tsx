import useGlobalStore, { GlobalState } from "@/app/stores/useGlobalStore";
import { useThree } from "@react-three/fiber";

function WithReady<T>(Component: React.ComponentType<T>) {
    return function WrappedComponent(props: T) {
        const presetReady = useGlobalStore(state => state.presetReady)
        const camera = useThree(state => state.camera)
        if (!presetReady || !camera.getObjectByName("target")) return <></>
        return (
            <Component {...props}></Component>
        )
    };
}

export default WithReady