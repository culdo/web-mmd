import { Avatar, Card, CardActionArea, CardContent, Dialog, DialogTitle, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useState } from "react";
import { blue } from "@mui/material/colors";
import { loadPreset, newPreset } from "@/app/components/panel/presetFn";

const presetOptions = {
    "Select from computer...": {
        icon: <FileUploadIcon />
    },
    "Empty preset": {
        icon: <AddIcon />
    }
};
function CreatePreset() {
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handlePresetKind = (value: string) => {
        if(value === "Select from computer...") {
            loadPreset()
        }  else if(value === "Empty preset") {
            newPreset()
        }
        setOpen(false);
    };
    return (
        <>
            <Card sx={{ maxWidth: 200 }}>
                <CardActionArea sx={{ height: "100%", textAlign: "center" }} onClick={handleClickOpen}>
                    <CardContent>
                        <AddIcon fontSize="large" />
                        <Typography component="div">
                            Add a new preset
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
            <SimpleDialog
                open={open}
                onClose={handlePresetKind}
            />
        </>
    );
}

export interface SimpleDialogProps {
    open: boolean;
    onClose: (value: string) => void;
}

function SimpleDialog(props: SimpleDialogProps) {
    const { onClose, open } = props;

    const handleListItemClick = (value: string) => {
        onClose(value);
    };

    return (
        <Dialog onClose={() => onClose(null)} open={open}>
            <DialogTitle>Choose a kind of preset</DialogTitle>
            <List sx={{ pt: 0 }}>
                {Object.entries(presetOptions).map(([presetKind, { icon }]) => (
                    <ListItem disablePadding key={presetKind}>
                        <ListItemButton onClick={() => handleListItemClick(presetKind)}>
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
                                    {icon}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={presetKind} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Dialog>
    );
}

export default CreatePreset;