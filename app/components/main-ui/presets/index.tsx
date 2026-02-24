import { loadPreset } from "../../panel/presetFn";
import LocalPreset from "./LocalPreset";
import CollectionsIcon from '@mui/icons-material/Collections';
import useNames from "./useNames";
import onRead from "./onRead";
import onLoad from "./onLoad";

const Presets = {
    Icon: CollectionsIcon,
    Component: LocalPreset,
    onCreate: loadPreset,
    useNames,
    onRead,
    onLoad
}

export default Presets;