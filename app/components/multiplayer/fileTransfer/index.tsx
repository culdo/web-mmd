import useGlobalStore from "@/app/stores/useGlobalStore";
import { createContext } from "react";
import CameraListener from "../../main-ui/cameras/CameraListener";
import ModelListener from "../../main-ui/models/ModelListener";
import MotionListener from "../../main-ui/motions/MotionListener";
import MusicListener from "../../main-ui/musics/MusicListener";
import PresetListener from "../../main-ui/presets/PresetListener";

export const SenderContext = createContext("")

function FileTransfer() {
    const peerChannels = useGlobalStore(state => state.peerChannels)

    return (
        <>
            {
                Object.entries(peerChannels)
                    .filter(([_, pc]) => pc.channels["fileTransfer"])
                    .map(([sender, _]) => (
                        <SenderContext.Provider key={sender} value={sender}>
                            <PresetListener />
                            <ModelListener />
                            <MotionListener />
                            <CameraListener />
                            <MusicListener />
                        </SenderContext.Provider>
                    ))
            }
        </>
    );
}

export default FileTransfer;