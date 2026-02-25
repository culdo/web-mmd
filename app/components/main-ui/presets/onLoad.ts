import useConfigStore, { addPreset } from "@/app/stores/useConfigStore";
import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore, { migratePreset, PresetState, setPreset } from "@/app/stores/usePresetStore";
import _ from "lodash";

type FilesKey = "cameraFiles" | "audioFiles" | "motionFiles" | "pmxFiles"

async function onLoad(name: string, data: string, channel: JSONDataChannel) {

    const onRequest = (uriPrefix: string) => new Promise<string>((resolve) => {
        let resourceSize = 0
        let receiveBufferSize = 0
        let receiveBuffer: string[] = []

        channel.send({
            uri: `${uriPrefix}/requestResource`
        })
        const onMessage = (e: MessageEvent<DataSchema>) => {
            const { uri, payload } = e.data
            if (!uri.startsWith(uriPrefix)) return
            const pathname = uri.split(uriPrefix + "/")[1]
            if (pathname == "resourceSize") {
                useGlobalStore.setState({ storeReady: false })
                resourceSize = payload
                receiveBuffer = []
            }
            if (pathname == "resourceData") {
                receiveBuffer.push(payload);
                const loading = document.getElementById("loading")
                if (loading) {
                    loading.textContent = "Loading " + Math.round(receiveBufferSize * 100 / resourceSize) + "%..."
                }
                receiveBufferSize += payload.length
                if (receiveBufferSize == resourceSize) {
                    channel.removeEventListener("message", onMessage)
                    resolve(receiveBuffer.join(""))
                }
            }
        }
        channel.addEventListener("message", onMessage)
    })

    const getResources = async (type: ResourceType, name: string, filesKey: FilesKey) => {
        const states = useConfigStore.getState()
        const filesMap = states[filesKey]
        if (!(name in filesMap)) {
            const data = await onRequest(`${type}/${name}`)
            if (filesKey === "pmxFiles") {
                const pmxFiles = JSON.parse(data)
                _.merge(filesMap, pmxFiles)
            } else {
                states[filesKey][name] = data
            }
            useConfigStore.setState({ [filesKey]: { ...filesMap } })
        }
    }

    addPreset(name)
    setPreset(name)
    const loadedPreset = JSON.parse(data) as PresetState
    const { camera, musicName, models } = loadedPreset
    await getResources("Cameras", camera, "cameraFiles")
    await getResources("Musics", musicName, "audioFiles")
    for (const model of Object.values(models)) {
        await getResources("Models", model.fileName, "pmxFiles")
        for (const motion of model.motionNames) {
            await getResources("Motions", motion, "motionFiles")
        }
    }

    const { version } = usePresetStore.getState()
    if (version != loadedPreset.version) {
        migratePreset(loadedPreset, loadedPreset.version)
    } else {
        usePresetStore.setState(loadedPreset)
    }
    useGlobalStore.setState({ storeReady: true })
}

export default onLoad;