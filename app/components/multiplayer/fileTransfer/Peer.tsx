import { createContext } from "react";
import useGlobalStore from "@/app/stores/useGlobalStore";
import CameraListener from "../../main-ui/cameras/CameraListener";
import ModelListener from "../../main-ui/models/ModelListener";
import MotionListener from "../../main-ui/motions/MotionListener";
import MusicListener from "../../main-ui/musics/MusicListener";
import PresetListener from "../../main-ui/presets/PresetListener";

export const SenderContext = createContext("")

function Peer({ sender }: { sender: string }) {
    const channel = useGlobalStore(state => state.peerChannels)[sender]?.channels["fileTansfer"]
    if (!channel) return null
    return (
        <SenderContext.Provider value={sender}>
            <PresetListener />
            <ModelListener />
            <MotionListener />
            <CameraListener />
            <MusicListener />
        </SenderContext.Provider>
    );
}

export default Peer;