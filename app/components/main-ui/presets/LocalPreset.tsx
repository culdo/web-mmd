import { MouseEvent } from "react";
import useConfigStore from "@/app/stores/useConfigStore";
import { setPreset } from "@/app/stores/usePresetStore";
import { MenuItem } from "@mui/material";
import { copyPreset, savePreset, saveConfigOnly, deletePreset } from "@/app/components/panel/presetFn";
import ResourceCard from "../resources/ResourceCard";
import useGlobalStore from "@/app/stores/useGlobalStore";
import WithLocalPresets from "./WithLocalPresets";

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
            <MenuItem onClick={copyPreset}>
                Copy Preset
            </MenuItem>
            <MenuItem onClick={savePreset}>
                Save Preset
            </MenuItem>
            <MenuItem onClick={saveConfigOnly}>
                Save Config Only
            </MenuItem>
            <MenuItem sx={{ color: 'red' }} onClick={deletePreset}>
                Delete Preset
            </MenuItem>
        </ResourceCard>
    );
}

export default WithLocalPresets(LocalPreset);