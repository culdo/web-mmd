import { loadFile } from "@/app/utils/gui";
import LocalMotion from "./LocalMotion";
import usePresetStore from "@/app/stores/usePresetStore";
import AnimationIcon from '@mui/icons-material/Animation';
import useLoad from "./useLoad";
import useNames from "./useNames";
import useRequest from "./useRequest";

const Motions = {
    icon: <AnimationIcon />,
    Component: LocalMotion,
    onCreate: () => loadFile((motionFile, motionName) => {
        usePresetStore.setState(({ models, motionFiles, targetModelId }) => {
            motionFiles[motionName] = motionFile
            models[targetModelId].motionNames[0] = motionName
            return {
                motionFiles: { ...motionFiles },
                models: { ...models }
            }
        })
    }),
    useNames,
    useRequest,
    useLoad
}
export default Motions;