import { Avatar, Card, CardActionArea, CardContent, Dialog, DialogTitle, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useState } from "react";
import { blue } from "@mui/material/colors";
import { useResource } from "../context";

const options = {
    "Open file...": {
        icon: <FileUploadIcon />
    }
};

function CreateResource() {
    const [open, setOpen] = useState(false);
    const { type, onCreate } = useResource()

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handlePresetKind = (value: string) => {
        if (value === "Open file...") {
            onCreate()
        }
        setOpen(false);
    };

    const handleListItemClick = (value: string) => {
        handlePresetKind(value);
    };
    return (
        <>
            <Card sx={{ maxWidth: 200 }}>
                <CardActionArea sx={{ height: "100%", textAlign: "center" }} onClick={handleClickOpen}>
                    <CardContent>
                        <AddIcon fontSize="large" />
                        <Typography component="div">
                            Add a new {type.slice(0, -1)}
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
            <Dialog onClose={() => handlePresetKind(null)} open={open}>
                <DialogTitle>Choose a kind of {type.slice(0, -1)}</DialogTitle>
                <List sx={{ pt: 0 }}>
                    {Object.entries(options).map(([resourceKind, { icon }]) => (
                        <ListItem disablePadding key={resourceKind}>
                            <ListItemButton onClick={() => handleListItemClick(resourceKind)}>
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
                                        {icon}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={resourceKind} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Dialog>
        </>
    );
}

export default CreateResource;