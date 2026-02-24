import { loadFile } from "@/app/utils/gui";
import LocalCamera from "./LocalCamera";
import usePresetStore from "@/app/stores/usePresetStore";
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import onLoad from "./onLoad";
import useNames from "./useNames";
import onRead from "./onRead";

const Cameras = {
    Icon: CameraAltIcon,
    Component: LocalCamera,
    onCreate: () => loadFile((cameraFile, name) => {
        usePresetStore.setState({ cameraFile, camera: name })
    }),
    useNames,
    onRead,
    onLoad
}

export default Cameras;