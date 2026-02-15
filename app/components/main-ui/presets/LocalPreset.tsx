import { MouseEvent } from "react";
import useConfigStore from "@/app/stores/useConfigStore";
import { setPreset } from "@/app/stores/usePresetStore";
import { MenuItem } from "@mui/material";
import { copyPreset, savePreset, saveConfigOnly, deletePreset } from "@/app/components/panel/presetFn";
import ResourceCard from "../resources/ResourceCard";
import useGlobalStore from "@/app/stores/useGlobalStore";

function LocalPreset({ presetName }: { presetName: string }) {
    const presetsInfo = useConfigStore(state => state.presetsInfo)
    const screenShot = presetsInfo[presetName]?.screenShot

    const preset = useConfigStore(state => state.preset)
    const isCurrentPreset = preset === presetName

    const onClick = (e: MouseEvent) => {
        setPreset(presetName, true)
        useGlobalStore.setState({openMainUI: false})
    }

    return (
        <ResourceCard
            name={presetName}
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

export default LocalPreset;