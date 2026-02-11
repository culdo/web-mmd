import { Card, CardActionArea, CardMedia, CardContent, Typography } from "@mui/material";
import styles from "./styles.module.css"

function PresetCard({ presetName, previewImgSrc, inPreview, outPreview, onClick }: {
    previewImgSrc: string,
    inPreview: (e: React.MouseEvent) => void,
    outPreview: (e: React.MouseEvent) => void,
    onClick: (e: React.MouseEvent) => void,
    presetName: string
}) {
    if (!presetName) return <></>
    return (
        <Card sx={{ maxWidth: 200 }}>
            <CardActionArea onMouseEnter={inPreview} onMouseLeave={outPreview} onClick={onClick}>
                <CardMedia
                    component="img"
                    height="100"
                    image={previewImgSrc}
                    alt="preset preview"
                />
                <CardContent sx={{ paddingTop: "8px", paddingBottom: "8px" }}>
                    <Typography variant="h6" component="div">
                        {presetName}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}

export default PresetCard;