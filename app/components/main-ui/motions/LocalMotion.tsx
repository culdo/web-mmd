import { MouseEvent } from "react";
import usePresetStore from "@/app/stores/usePresetStore";
import { MenuItem } from "@mui/material";
import ResourceCard from "../resources/ResourceCard";
import onDelete from "./onDelete";

function LocalMotion({ name }: { name: string }) {

    const onClick = (e: MouseEvent) => {
        
    }

    return (
        <ResourceCard
            name={name}
            onClick={onClick}
            selected={false}
        >
            <MenuItem sx={{ color: 'red' }} onClick={() => onDelete(name)}>
                Delete Motion
            </MenuItem>
        </ResourceCard>
    );
}

export default LocalMotion;