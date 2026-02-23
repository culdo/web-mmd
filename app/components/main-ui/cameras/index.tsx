import { loadFile } from "@/app/utils/gui";
import LocalCamera from "./LocalCamera";
import usePresetStore from "@/app/stores/usePresetStore";
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import useLoad from "./useLoad";
import useNames from "./useNames";
import useRequest from "./useRequest";

const Cameras = {
    Icon: CameraAltIcon,
    Component: LocalCamera,
    onCreate: () => loadFile((cameraFile, name) => {
        usePresetStore.setState({ cameraFile, camera: name })
    }),
    useNames,
    useRequest,
    useLoad
}

export default Cameras;