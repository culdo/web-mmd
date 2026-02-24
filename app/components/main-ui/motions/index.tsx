import { loadFile } from "@/app/utils/gui";
import LocalMotion from "./LocalMotion";
import usePresetStore from "@/app/stores/usePresetStore";
import AnimationIcon from '@mui/icons-material/Animation';
import onLoad from "./onLoad";
import useNames from "./useNames";
import onRead from "./onRead";

const Motions = {
    Icon: AnimationIcon,
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
    onRead,
    onLoad
}
export default Motions;