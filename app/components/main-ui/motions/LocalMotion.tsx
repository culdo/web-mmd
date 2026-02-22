import { MouseEvent } from "react";
import usePresetStore from "@/app/stores/usePresetStore";
import { MenuItem } from "@mui/material";
import ResourceCard from "../resources/ResourceCard";
import WithLocalMotions from "./WithLocalMotions";

function LocalMotion({ name }: { name: string }) {

    const onClick = (e: MouseEvent) => {
        
    }

    return (
        <ResourceCard
            name={name}
            onClick={onClick}
            selected={false}
        >
            <MenuItem sx={{ color: 'red' }} onClick={() => {
                usePresetStore.setState(({ motionFiles }) => {
                    delete motionFiles[name]
                    return { motionFiles: { ...motionFiles } }
                })
            }}>
                Delete Motion
            </MenuItem>
        </ResourceCard>
    );
}

export default WithLocalMotions(LocalMotion);