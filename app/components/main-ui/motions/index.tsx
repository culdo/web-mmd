import usePresetStore from "@/app/stores/usePresetStore";
import LocalMotion from "./LocalMotion";

function LocalMotions() {
    const motionFiles = usePresetStore(state => state.motionFiles)

    return (
        <>
            {
                Object.entries(motionFiles).map(([name]) => <LocalMotion key={name} name={name}></LocalMotion>)
            }
        </>
    );
}

export default LocalMotions;