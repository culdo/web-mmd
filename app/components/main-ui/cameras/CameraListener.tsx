import WithLocalCameras from "./WithLocalCameras";
import ResourceListener from "../../multiplayer/fileTransfer/ResourceListener";
import usePresetStore from "@/app/stores/usePresetStore";

function CameraListener({ name }: { name: string }) {
    const cameraFile = usePresetStore(state => state.cameraFile)
    
    const onRequest = (name: string) => Promise.resolve(cameraFile)

    return (
        <ResourceListener
            type="camera"
            name={name}
            onRequest={onRequest}
        >
        </ResourceListener>
    );
}

export default WithLocalCameras(CameraListener, "camera");