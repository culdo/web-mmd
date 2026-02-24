import { MouseEvent } from "react";
import useConfigStore from "@/app/stores/useConfigStore";
import { setPreset } from "@/app/stores/usePresetStore";
import { MenuItem } from "@mui/material";
import { copyPreset, savePreset, saveConfigOnly, deletePreset } from "@/app/components/panel/presetFn";
import ResourceCard from "../resources/ResourceCard";
import useGlobalStore from "@/app/stores/useGlobalStore";

function LocalPreset({ name }: { name: string }) {
    const presetsInfo = useConfigStore(state => state.presetsInfo)
    const screenShot = presetsInfo[name]?.screenShot

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
            <MenuItem sx={{ color: 'red' }} onClick={() => deletePreset(name)}>
                Delete Preset
            </MenuItem>
        </ResourceCard>
    );
}

export default LocalPreset;