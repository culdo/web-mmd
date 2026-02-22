import WithLocalMusics from "./WithLocalMusics";
import ResourceListener from "../../multiplayer/fileTransfer/ResourceListener";
import usePresetStore from "@/app/stores/usePresetStore";

function MusicListener({ name }: { name: string }) {
    const audioFile = usePresetStore(state => state.audioFile)

    const onRequest = (name: string) => Promise.resolve(audioFile)

    return (
        <ResourceListener
            type="music"
            name={name}
            onRequest={onRequest}
        >
        </ResourceListener>
    );
}

export default WithLocalMusics(MusicListener, "music");