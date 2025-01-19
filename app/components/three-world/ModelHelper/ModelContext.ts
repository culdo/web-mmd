import { createContext, useContext } from 'react';
import { SkinnedMesh } from 'three';

export const ModelContext = createContext<SkinnedMesh>(null);
export const useModel = () => useContext(ModelContext);
