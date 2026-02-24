import { loadFile } from "@/app/utils/gui";
import LocalMusic from "./LocalMusic";
import usePresetStore from "@/app/stores/usePresetStore";
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import useNames from "./useNames";
import onRead from "./onRead";
import onLoad from "./onLoad";

const Musics = {
    Icon: MusicNoteIcon,
    Component: LocalMusic,
    onCreate: () => loadFile((audioFile, musicName) => {
        usePresetStore.setState({ audioFile, musicName })
    }),
    useNames,
    onRead,
    onLoad
}

export default Musics;