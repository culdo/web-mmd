import { useEffect } from "react";
import useFileTransfer from "./useFileTransfer";
import ResourceListener from "./ResourceListener";
import { useResource } from "../../main-ui/context";
import useGlobalStore from "@/app/stores/useGlobalStore";

function ResourcesListener() {
    const { type, useNames } = useResource()
    const names = useNames()

    const resourceHashes = useGlobalStore(state => state.filesHashes)[type]
    const { channel } = useFileTransfer(type)

    useEffect(() => {
        const onMessage = (e: MessageEvent<DataSchema>) => {
            const { uri } = e.data
            if (uri == `${type}/requestResourceHashes`) {
                channel.send({
                    uri: `${type}/resourceHashes`,
                    payload: resourceHashes
                })
            }
        }
        channel.addEventListener("message", onMessage)
        return () => channel.removeEventListener("message", onMessage)
    }, [resourceHashes])

    return names.map(
        name => <ResourceListener key={name} name={name} />
    )
}


export default ResourcesListener;