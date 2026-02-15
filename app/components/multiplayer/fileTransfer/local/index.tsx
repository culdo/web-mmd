import useConfigStore from "@/app/stores/useConfigStore";
import Resource from "./resource";
import usePresetStore, { storage } from "@/app/stores/usePresetStore";

function LocalResources() {
    const presetList = useConfigStore(state => state.presetsList)
    const pmxFiles = usePresetStore(state => state.pmxFiles)
    const motionFiles = usePresetStore(state => state.motionFiles)
    const cameraFile = usePresetStore(state => state.cameraFile)
    const audioFile = usePresetStore(state => state.audioFile)
    const onPresetRequest = async (name: string) => {
        const preset = await storage.getItem(name)
        return JSON.stringify(preset)
    }
    const onMeshRequest = async (name: string) => {
        return pmxFiles.models[name]
    }
    const onMotionRequest = async (name: string) => {
        return motionFiles[name]
    }

    return (
        <>
            {
                presetList.map(presetName => <Resource key={presetName} type="preset" name={presetName} onRequest={onPresetRequest}></Resource>)
            }
            {
                Object.entries(pmxFiles).map(([meshName, _]) => <Resource key={meshName} type="model" name={meshName} onRequest={onMeshRequest}></Resource>)
            }
            {
                Object.entries(motionFiles).map(([motionName, _]) => <Resource key={motionName} type="motion" name={motionName} onRequest={onMotionRequest}></Resource>)
            }
            <Resource type="camera" name="camera" onRequest={() => Promise.resolve(cameraFile)}></Resource>
            <Resource type="audio" name="audio" onRequest={() => Promise.resolve(audioFile)}></Resource>
        </>
    );
}

export default LocalResources;