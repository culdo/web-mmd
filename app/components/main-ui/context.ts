import Presets from "./presets";
import Models from "./models";
import Motions from "./motions";
import Cameras from "./cameras";
import Musics from "./musics";
import { createContext, useContext } from "react";

export const resourcesMap = {
    Presets,
    Models,
    Motions,
    Cameras,
    Musics
};

export const ResourceTypeContext = createContext<ResourceType>(null);

export const useResource = () => {
    const type = useContext(ResourceTypeContext)
    return ({
        type,
        ...resourcesMap[type]
    })
}
