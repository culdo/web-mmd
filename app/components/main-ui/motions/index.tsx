import { loadFile } from "@/app/utils/gui";
import LocalMotion from "./LocalMotion";
import usePresetStore from "@/app/stores/usePresetStore";
import AnimationIcon from '@mui/icons-material/Animation';
import onLoad from "./onLoad";
import useNames from "./useNames";
import onRead from "./onRead";
import useConfigStore from "@/app/stores/useConfigStore";

const Motions = {
    Icon: AnimationIcon,
    Component: LocalMotion,
    onCreate: () => loadFile((motionFile, motionName) => {
        useConfigStore.setState(({ motionFiles }) => {
            motionFiles[motionName] = motionFile
            return {
                motionFiles: { ...motionFiles }
            }
        })
        usePresetStore.setState(({ models, targetModelId }) => {
            models[targetModelId].motionNames[0] = motionName
            return {
                models: { ...models }
            }
        })
    }),
    useNames,
    onRead,
    onLoad
}
export default Motions;