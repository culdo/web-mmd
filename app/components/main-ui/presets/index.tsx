import { loadPreset } from "../../panel/presetFn";
import LocalPreset from "./LocalPreset";
import CollectionsIcon from '@mui/icons-material/Collections';
import usePresetsNames from "./useNames";
import useRequest from "./useRequest";
import usePresetLoad from "./useLoad";

const Presets = {
    Icon: CollectionsIcon,
    Component: LocalPreset,
    onCreate: loadPreset,
    useNames: usePresetsNames,
    useRequest: useRequest,
    useLoad: usePresetLoad
}

export default Presets;