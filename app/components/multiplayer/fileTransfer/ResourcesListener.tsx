import { useEffect } from "react";
import useFileTransfer from "./useFileTransfer";
import ResourceListener from "./ResourceListener";
import { useResource } from "../../main-ui/context";

function ResourcesListener() {
    const { type, useNames, useRequest } = useResource()
    const names = useNames()
    const onRequest = useRequest()

    const { channel } = useFileTransfer(type)

    useEffect(() => {
        const onMessage = (e: MessageEvent<DataSchema>) => {
            const { uri } = e.data
            if (uri == `${type}/requestResourceNames`) {
                channel.send({
                    uri: `${type}/resourceNames`,
                    payload: names
                })
            }
        }
        channel.addEventListener("message", onMessage)
        return () => channel.removeEventListener("message", onMessage)
    }, [names])

    return names.map(
        name => <ResourceListener key={name} name={name} onRequest={onRequest} />
    )
}


export default ResourcesListener;