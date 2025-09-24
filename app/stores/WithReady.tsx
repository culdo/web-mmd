import useGlobalStore from "@/app/stores/useGlobalStore";

function WithReady<T>(Component: React.ComponentType<T>) {
    return function WrappedComponent(props: T) {
        const presetReady = useGlobalStore(state => state.presetReady)
        const player = useGlobalStore(state => state.player)
        if (!presetReady || !player) return <></>
        return (
            <Component {...props}></Component>
        )
    };
}

export default WithReady