import { resourcesMap } from "../resourcesMap";
import { useResourceType } from "./context";

function LocalResources() {
    const type = useResourceType()
    const { useNames, Component } = resourcesMap[type]
    const names = useNames()
    return names.map(name => <Component key={name} name={name}></Component>);
}

export default LocalResources;