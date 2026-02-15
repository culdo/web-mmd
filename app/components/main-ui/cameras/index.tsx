import { MouseEvent } from "react";
import usePresetStore from "@/app/stores/usePresetStore";
import { MenuItem } from "@mui/material";
import ResourceCard from "../resources/ResourceCard";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { nanoid } from "nanoid";

function LocalCameras({ name }: { name: string }) {

    const cameraName = usePresetStore(state => state.camera)
    const onClick = (e: MouseEvent) => {
        
    }

    return (
        <ResourceCard
            name={cameraName}
            onClick={onClick}
            selected={false}
        >
        </ResourceCard>
    );
}

export default LocalCameras;