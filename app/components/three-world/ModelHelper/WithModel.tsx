import useGlobalStore, { GlobalState } from "@/app/stores/useGlobalStore";
import { ModelContext } from "./ModelContext";
import { SkinnedMesh } from "three";
import { useRef, useState } from "react";

type ModelKeys<T> = {
    [K in keyof T]: T[K] extends SkinnedMesh ? K : never;
}[keyof T];

function WithModel<T>(Component: React.ComponentType<T>, key: ModelKeys<GlobalState>) {
    return function WrappedComponent(props: T) {
        const mesh = useGlobalStore(state => state[key])
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