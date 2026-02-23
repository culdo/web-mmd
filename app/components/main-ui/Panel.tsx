import { useState } from "react";
import { Box } from "@mui/material";
import AppBar from '@mui/material/AppBar';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Resources from "./resources";
import PeersResources from "./resources/PeersResources";
import LocalResources from "./resources/LocalResources";
import { ResourceTypeContext } from "./resources/context";
import { resourcesMap } from "./resourcesMap";

const drawerWidth = 180;
const drawerBottomItems = {
    "Settings": {
        icon: <SettingsIcon />,
        component: <div>Settings</div>
    }
}

const drawerItems = {
    ...resourcesMap,
    ...drawerBottomItems
}

function Panel() {
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
                {Object.entries(resourcesMap).map(([text, item]) => (
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
                        <ResourceTypeContext.Provider value={selectedKey}>
                            <Resources selectedKey={selectedKey} onCreate={drawerItems[selectedKey].onCreate}>
                                <LocalResources />
                                <PeersResources />
                            </Resources>
                        </ResourceTypeContext.Provider>
                    )
                }
            </Box>
        </Box>
    );
}

export default Panel;

