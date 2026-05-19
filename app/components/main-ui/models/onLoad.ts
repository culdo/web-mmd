import useConfigStore from "@/app/stores/useConfigStore";
import _ from "lodash";

function onLoad(name: string, data: string, channel: JSONDataChannel = null) {
    const model = JSON.parse(data)
    useConfigStore.setState(({ pmxFiles }) => {
        _.merge(pmxFiles, model)
        return { pmxFiles: { ...pmxFiles } }
    })
}

export default onLoad;