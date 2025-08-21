import { createContext, MutableRefObject, useContext } from 'react';
import { SkinnedMesh } from 'three';

type ModelContextProps = {
    mesh: SkinnedMesh
    runtimeHelper: MutableRefObject<{
        resetPhysic?: () => void
    }>
}

export const ModelContext = createContext<ModelContextProps>(null);
export const useModel = () => useContext(ModelContext).mesh;
export const useRuntimeHelper = () => useContext(ModelContext).runtimeHelper.current
