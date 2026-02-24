import LocalModel from "./LocalModel";
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import onLoad from "./onLoad";
import useNames from "./useNames";
import onRead from "./onRead";
import onCreate from "./onCreate";

const Models = {
    Icon: AccessibilityNewIcon,
    Component: LocalModel,
    onCreate,
    useNames,
    onRead,
    onLoad
}

export default Models;