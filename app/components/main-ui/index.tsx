import { useRef } from "react";
import { Box, Button, Modal } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import useGlobalStore from "@/app/stores/useGlobalStore";
import useAutoHide from "../control-bar/audio-player/useAutoHide";
import Panel from "./Panel";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "75%",
    height: "70%",
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const buttonStyle = {
    position: 'fixed',
    top: "25px",
    left: "25px"
}

function MainUI() {
    const openMainUI = useGlobalStore(state => state.openMainUI)
    const handleOpen = () => useGlobalStore.setState({ openMainUI: true });
    const handleClose = () => useGlobalStore.setState({ openMainUI: false });

    const buttonRef = useRef<HTMLButtonElement>(null)
    const onPlay = () => {
        buttonRef.current.style.display = "none";
    }
    const onPause = () => {
        buttonRef.current.style.display = "flex";
    }
    useAutoHide(onPlay, onPause)

    return (
        <>
            <Button ref={buttonRef} onClick={handleOpen} variant="contained" sx={buttonStyle} size="large">
                <MenuIcon fontSize="inherit" />
            </Button>
            <Modal open={openMainUI} onClose={handleClose}>
                <Box sx={style}>
                    <Panel></Panel>
                </Box>
            </Modal>
        </>
    );
}

export default MainUI;
