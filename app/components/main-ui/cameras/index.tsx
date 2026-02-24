import { loadFile } from "@/app/utils/gui";
import LocalCamera from "./LocalCamera";
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import onLoad from "./onLoad";
import useNames from "./useNames";
import onRead from "./onRead";
import onCreate from "./onCreate";

const Cameras = {
    Icon: CameraAltIcon,
    Component: LocalCamera,
    onCreate,
    useNames,
    onRead,
    onLoad
}

export default Cameras;