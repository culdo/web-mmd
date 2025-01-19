import useGlobalStore, { GlobalState } from "@/app/stores/useGlobalStore";
import { ModelContext } from "./ModelContext";
import { SkinnedMesh } from "three";

type ModelKeys<T> = {
    [K in keyof T]: T[K] extends SkinnedMesh ? K : never;
}[keyof T];

function WithModel<T>(Component: React.ComponentType<T>, key: ModelKeys<GlobalState>) {
    return function WrappedComponent(props: T) {
        const model = useGlobalStore(state => state[key])
        if (!model) return <></>
        return (
            <ModelContext.Provider value={model}>
                <Component {...props}></Component>
            </ModelContext.Provider>
        )
    };
}

export default WithModel