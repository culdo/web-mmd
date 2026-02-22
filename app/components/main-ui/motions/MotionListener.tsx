import ResourceListener from "../../multiplayer/fileTransfer/ResourceListener";
import usePresetStore from "@/app/stores/usePresetStore";
import WithLocalMotions from "./WithLocalMotions";

function MotionListener({ name }: { name: string }) {
    const motionFiles = usePresetStore(state => state.motionFiles)
    
    const onRequest = (name: string) => Promise.resolve(motionFiles[name])

    return (
        <ResourceListener
            type="motion"
            name={name}
            onRequest={onRequest}
        >
        </ResourceListener>
    );
}

export default WithLocalMotions(MotionListener, "motion");