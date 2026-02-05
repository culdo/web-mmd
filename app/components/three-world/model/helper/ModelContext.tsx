import { createContext, useContext } from 'react';
import { SkinnedMesh } from 'three';

type ModelContextProps = {
    mesh: SkinnedMesh
}

export const ModelContext = createContext<ModelContextProps>(null);
export const useModel = () => useContext(ModelContext).mesh;
export function CheckModel<T>(Comp: React.ComponentType<T>) {
    return function WrapCom(props: T) {
        const mesh = useModel()
        if (mesh.geometry.userData.MMD?.rigidBodies.length == 0) return <></>
        return <Comp {...props}></Comp>;
    }
}