import { loadModel } from "@/app/utils/gui";
import LocalModel from "./LocalModel";
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import useLoad from "./useLoad";
import useNames from "./useNames";
import useRequest from "./useRequest";

const Models = {
    icon: <AccessibilityNewIcon />,
    Component: LocalModel,
    onCreate: () => loadModel(true),
    useNames,
    useRequest,
    useLoad
}

export default Models;