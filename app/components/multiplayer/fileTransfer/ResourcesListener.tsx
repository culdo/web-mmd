import ResourceListener from "./ResourceListener";
import { useResource } from "../../main-ui/context";
import useFileTransfer from "./useFileTransfer";

function ResourcesListener() {
    const { useNames, type } = useResource()
    useFileTransfer(type)
    const names = useNames()

    return names.map(
        name => <ResourceListener key={name} name={name} />
    )
}


export default ResourcesListener;