import useGlobalStore from "@/app/stores/useGlobalStore";
import { ModelContext, useModel } from "./ModelContext";
import { useRef } from "react";
import usePresetStore from "@/app/stores/usePresetStore";

function WithModel<T>(Component: React.ComponentType<T>) {
    return function WrappedComponent(props: T) {
        const targetModelId = usePresetStore(state => state.targetModelId)
        const mesh = useGlobalStore(state => state.models)[targetModelId]
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