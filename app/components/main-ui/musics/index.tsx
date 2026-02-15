import { MouseEvent } from "react";
import usePresetStore from "@/app/stores/usePresetStore";
import { MenuItem } from "@mui/material";
import ResourceCard from "../resources/ResourceCard";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { nanoid } from "nanoid";

function LocalMusics({ name }: { name: string }) {

    const musicName = usePresetStore(state => state.musicName)
    const onClick = (e: MouseEvent) => {
        
    }

    return (
        <ResourceCard
            name={musicName}
            onClick={onClick}
            selected={false}
        >
        </ResourceCard>
    );
}

export default LocalMusics;