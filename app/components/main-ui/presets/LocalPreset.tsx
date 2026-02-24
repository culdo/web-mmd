import { MouseEvent } from "react";
import useConfigStore from "@/app/stores/useConfigStore";
import { setPreset } from "@/app/stores/usePresetStore";
import { MenuItem } from "@mui/material";
import { copyPreset, savePreset, saveConfigOnly } from "@/app/components/panel/presetFn";
import ResourceCard from "../resources/ResourceCard";
import useGlobalStore from "@/app/stores/useGlobalStore";
import useDelete from "./useDelete";

function LocalPreset({ name }: { name: string }) {
    const presetsInfo = useConfigStore(state => state.presetsInfo)
    const screenShot = presetsInfo[name]?.screenShot
    const onDelete = useDelete()

    const preset = useConfigStore(state => state.preset)
    const isCurrentPreset = preset === name

    const onClick = (e: MouseEvent) => {
        setPreset(name, true)
        useGlobalStore.setState({ openMainUI: false })
    }

    return (
        <ResourceCard
            name={name}
            previewImgSrc={screenShot}
            onClick={isCurrentPreset ? undefined : onClick}
            selected={isCurrentPreset}
        >
            <MenuItem onClick={() => copyPreset(name)}>
                Copy Preset
            </MenuItem>
            <MenuItem onClick={() => savePreset(name)}>
                Save Preset
            </MenuItem>
            <MenuItem onClick={() => saveConfigOnly(name)}>
                Save Config Only
            </MenuItem>
            <MenuItem sx={{ color: 'red' }} onClick={() => onDelete(name)}>
                Delete Preset
            </MenuItem>
        </ResourceCard>
    );
}

export default LocalPreset;