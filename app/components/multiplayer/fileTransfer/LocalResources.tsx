import { useResource } from "../../main-ui/context";
import useGenHash from "./useGenHash";

function LocalResources() {
    const { useNames } = useResource()
    const names = useNames()
    return names.map(name => <LocalResource key={name} name={name}></LocalResource>);
}

function LocalResource({ name }: { name: string }) {
    useGenHash(name)
    return <></>
}

export default LocalResources;