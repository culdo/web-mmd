import { useResource } from "../context";

function LocalResources() {
    const { useNames, Component } = useResource()
    const names = useNames()
    return names.map(name => <Component key={name} name={name}></Component>);
}

export default LocalResources;