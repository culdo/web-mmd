import { Avatar, Card, CardActionArea, CardContent, Dialog, DialogTitle, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useState } from "react";
import { blue } from "@mui/material/colors";

const options = {
    "Select from computer...": {
        icon: <FileUploadIcon />
    }
};

function CreateResource({ type, onLoad }: { type: string, onLoad: () => void }) {
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handlePresetKind = (value: string) => {
        if (value === "Select from computer...") {
            onLoad()
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
                            Add a new {type}
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
            <Dialog onClose={() => handlePresetKind(null)} open={open}>
                <DialogTitle>Choose a kind of {type}</DialogTitle>
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