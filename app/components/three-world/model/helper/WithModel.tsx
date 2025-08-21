import useGlobalStore from "@/app/stores/useGlobalStore";
import { ModelContext, useModel } from "./ModelContext";
import { useRef } from "react";

function WithModel<T>(Component: React.ComponentType<T>, key: string) {
    return function WrappedComponent(props: T) {
        const mesh = useGlobalStore(state => state.models)[key]
        const runtimeHelper = useRef({})
        if (!mesh) return <></>
        return (
            <ModelContext.Provider value={{ mesh: mesh, runtimeHelper }}>
                <Component {...props}></Component>
            </ModelContext.Provider>
        )
    };
}

export default WithModel

export function CheckModel<T>(Comp: React.ComponentType<T>) {
    return function WrapCom(props: T) {
        const mesh = useModel()
        if (!mesh.geometry.userData.MMD?.rigidBodies) return <></>
        return <Comp {...props}></Comp>;
    }
}