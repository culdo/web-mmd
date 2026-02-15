import { Card, CardActionArea, CardMedia, CardContent, Typography, CardActions, Button, IconButton, Menu, Tooltip } from "@mui/material";
import { useState } from "react";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

const ITEM_HEIGHT = 48;

function ResourceCard({ name, previewImgSrc, onClick, selected = false, children }: {
    previewImgSrc?: string,
    onClick: (e: React.MouseEvent) => void,
    name: string,
    selected?: boolean,
    children?: React.ReactNode
}) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    return (
        <Card
            sx={{
                maxWidth: 200,
                '&:hover': {
                    [`& .${name}-actions`]: {
                        display: 'flex',
                    },
                }
            }}
        >
            <CardActionArea
                onClick={open ? undefined : onClick}
                data-active={selected ? '' : undefined}
                sx={{
                    '&[data-active]': {
                        backgroundColor: 'action.selected',
                        '&:hover': {
                            backgroundColor: 'action.selectedHover',
                        },
                    },
                }}
            >
                {
                    previewImgSrc ?
                        <CardMedia
                            component="img"
                            height="100"
                            image={previewImgSrc}
                            alt="resource preview"
                        /> :
                        <CardContent sx={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <InsertDriveFileIcon fontSize="large" />
                        </CardContent>
                }
                <CardActions
                    disableSpacing
                    sx={{
                        paddingTop: '4px',
                        paddingBottom: '4px',
                        width: '100%',
                    }}>
                    <Tooltip title={name}>
                        <Typography noWrap variant="h6" component="div">
                            {name}
                        </Typography>
                    </Tooltip>
                    {
                        children &&
                        <>
                            <IconButton
                                component="div"
                                aria-label="more"
                                id="long-button"
                                aria-controls={open ? 'long-menu' : undefined}
                                aria-expanded={open ? 'true' : undefined}
                                aria-haspopup="true"
                                sx={{ marginLeft: "auto" }}
                                onClick={handleClick}
                            >
                                <MoreVertIcon />
                            </IconButton>
                            <Menu
                                id="long-menu"
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                                slotProps={{
                                    paper: {
                                        style: {
                                            maxHeight: ITEM_HEIGHT * 4.5,
                                            width: '20ch',
                                        },
                                    },
                                    list: {
                                        'aria-labelledby': 'long-button',
                                    },
                                }}
                            >
                                {children}
                            </Menu>
                        </>
                    }
                </CardActions>
            </CardActionArea>
        </Card>
    );
}

export default ResourceCard;