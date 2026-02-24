import { loadModel } from "@/app/utils/gui";
import LocalModel from "./LocalModel";
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import onLoad from "./onLoad";
import useNames from "./useNames";
import onRead from "./onRead";

const Models = {
    Icon: AccessibilityNewIcon,
    Component: LocalModel,
    onCreate: () => loadModel(true),
    useNames,
    onRead,
    onLoad
}

export default Models;