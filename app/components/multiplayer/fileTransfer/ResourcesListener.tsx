import { useEffect } from "react";
import useFileTransfer from "./useFileTransfer";
import ResourceListener from "./ResourceListener";
import { resourcesMap } from "../../main-ui/resourcesMap";
import { useResourceType } from "../../main-ui/resources/context";

function ResourcesListener() {
    const type = useResourceType()
    const { useNames, useRequest } = resourcesMap[type]
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
        name => <ResourceListener
            name={name}
            onRequest={onRequest}
        />
    )
}


export default ResourcesListener;