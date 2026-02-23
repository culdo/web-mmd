import useGlobalStore from "@/app/stores/useGlobalStore";
import RemoteResources from "./RemoteResources";
import { addPreset } from "@/app/stores/useConfigStore";
import usePresetStore, { migratePreset, setPreset } from "@/app/stores/usePresetStore";
import { SenderContext } from "../../multiplayer/fileTransfer";

const onLoadMap = {
    "preset": (name: string, data: string) => {
        addPreset(name)
        setPreset(name)
        const loadedPreset = JSON.parse(data)
        const { version } = usePresetStore.getState()
        if (version != loadedPreset.version) {
            migratePreset(loadedPreset, loadedPreset.version)
        } else {
            usePresetStore.setState(loadedPreset)
        }
        useGlobalStore.setState({ presetReady: true })
    },
    "motion": (name: string, data: string) => {
        usePresetStore.setState(({ motionFiles }) => {
            return { motionFiles: { ...motionFiles, [name]: data } }
        })
    },
    "model": (name: string, data: string) => {
        usePresetStore.setState(({ pmxFiles }) => {
            pmxFiles.models[name] = data
            return { pmxFiles: { ...pmxFiles } }
        })
    },
    "camera": (name: string, data: string) => {
        usePresetStore.setState({ cameraFile: data })
    },
    "music": (name: string, data: string) => {
        usePresetStore.setState({ audioFile: data })
    }
}

function PeersResources({ type }: { type: ResourceType }) {
    const peerChannels = useGlobalStore(state => state.peerChannels)
    return (
        <>
            {
                Object.entries(peerChannels)
                    .filter(([_, pc]) => pc.channels["fileTransfer"])
                    .map(([sender, _]) => (
                        <SenderContext.Provider value={sender}>
                            <RemoteResources key={sender} type={type} onLoad={onLoadMap[type]} />
                        </SenderContext.Provider>
                    ))
            }
        </>
    );
}

export default PeersResources;