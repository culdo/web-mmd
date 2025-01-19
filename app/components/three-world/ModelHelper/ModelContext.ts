import { createContext, use } from 'react';
import { SkinnedMesh } from 'three';

export const ModelContext = createContext<SkinnedMesh>(null);
export const useModel = () => use(ModelContext);
