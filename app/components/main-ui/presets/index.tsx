import LocalPreset from "./LocalPreset";
import CollectionsIcon from '@mui/icons-material/Collections';
import useNames from "./useNames";
import onRead from "./onRead";
import onLoad from "./onLoad";
import onCreate from "./onCreate";

const Presets = {
    Icon: CollectionsIcon,
    Component: LocalPreset,
    onCreate,
    useNames,
    onRead,
    onLoad
}

export default Presets;