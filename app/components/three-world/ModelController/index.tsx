import useGlobalStore from "@/app/stores/useGlobalStore";
import Morph from "./morph";
import Material from "./material";

const keyMap = {
    Character: "characterPromise",
    Stage: "stagePromise"
} as const

function ModelController({ type }: { type: keyof typeof keyMap }) {

    const modelPromise = useGlobalStore.getState()[keyMap[type]]
    const props = { type, modelPromise }
    
    return (
        <>
            <Morph {...props}></Morph>
            <Material {...props}></Material>
        </>
    );
}

export default ModelController;