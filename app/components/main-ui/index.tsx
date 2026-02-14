import { useRef, useState } from "react";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { Box, Button, Modal } from "@mui/material";
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import AnimationIcon from '@mui/icons-material/Animation';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import CollectionsIcon from '@mui/icons-material/Collections';
import ListItemText from '@mui/material/ListItemText';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import MenuIcon from '@mui/icons-material/Menu';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Presets from "./presets";
import Resource from "./resource";
import { loadPreset } from "../panel/presetFn";

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
    const [open, setOpen] = useState(true);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <>
            <Button onClick={handleOpen} variant="contained" sx={buttonStyle} size="large">
                <MenuIcon fontSize="inherit" />
            </Button>
            <Modal open={open} onClose={handleClose}>
                <Box sx={style}>
                    <ResponsiveDrawer></ResponsiveDrawer>
                </Box>
            </Modal>
        </>
    );
}

export default MainUI;


const drawerWidth = 180;
const drawerTopItems = {
    "Presets": {
        icon: <CollectionsIcon />,
        component: <Presets />,
        onLoad: loadPreset
    },
    "Models": {
        icon: <AccessibilityNewIcon />,
        component: <div>Models</div>,
        onLoad: loadPreset
    },
    "Motions": {
        icon: <AnimationIcon />,
        component: <div>Motions</div>,
        onLoad: loadPreset
    },
    "Cameras": {
        icon: <CameraAltIcon />,
        component: <div>Cameras</div>,
        onLoad: loadPreset
    },
    "Musics": {
        icon: <MusicNoteIcon />,
        component: <div>Musics</div>,
        onLoad: loadPreset
    }
}
const drawerBottomItems = {
    "Settings": {
        icon: <SettingsIcon />,
        component: <div>Settings</div>
    }
}

const drawerItems = {
    ...drawerTopItems,
    ...drawerBottomItems
}

function ResponsiveDrawer() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const handleDrawerClose = () => {
        setIsClosing(true);
        setMobileOpen(false);
    };

    const handleDrawerTransitionEnd = () => {
        setIsClosing(false);
    };

    const handleDrawerToggle = () => {
        if (!isClosing) {
            setMobileOpen(!mobileOpen);
        }
    };

    const [selectedKey, setSelectedKey] = useState<keyof typeof drawerItems>("Presets");

    const drawer = (
        <div>
            <List>
                {Object.entries(drawerTopItems).map(([text, item]) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton selected={selectedKey === text} onClick={() => {
                            setSelectedKey(text)
                            setMobileOpen(false)
                        }}>
                            <ListItemIcon>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                {Object.entries(drawerBottomItems).map(([text, item]) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton selected={selectedKey === text} onClick={() => {
                            setSelectedKey(text)
                            setMobileOpen(false)
                        }}>
                            <ListItemIcon>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }} id="drawer-container">
            <AppBar
                position="fixed"
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        Main menu
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                aria-label="mailbox folders"
            >
                {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onTransitionEnd={handleDrawerTransitionEnd}
                    onClose={handleDrawerClose}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
                    }}
                    slotProps={{
                        root: {
                            keepMounted: true, // Better open performance on mobile.
                        },
                        paper: { style: { position: "absolute" } },
                        backdrop: { style: { position: "absolute" } },
                    }}
                    ModalProps={{
                        container: document.getElementById('drawer-container'),
                        style: { position: 'absolute' },
                        keepMounted: true
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    position: "fixed",
                    top: 0,
                    right: 0,
                    overflowY: "auto",
                    gap: 2
                }}
            >
                {
                    selectedKey == "Settings" ? (
                        <Typography variant="h4">{selectedKey}</Typography>
                    ) : (
                        <Resource selectedKey={selectedKey} onLoad={drawerItems[selectedKey].onLoad}>
                            {drawerItems[selectedKey].component}
                        </Resource>
                    )
                }
            </Box>
        </Box>
    );
}
