import { MouseEvent } from "react";
import usePresetStore from "@/app/stores/usePresetStore";
import { MenuItem } from "@mui/material";
import ResourceCard from "../resources/ResourceCard";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { nanoid } from "nanoid";
import onDelete from "./onDelete";

function LocalModel({ name }: { name: string }) {

    const onClick = (e: MouseEvent) => {
        const newName = prompt("Enter model name", `${name.split("/").pop().split(".")[0]}-${nanoid(5)}`)
        if (!newName) return
        usePresetStore.setState(({ models }) => {
            models[newName] = {
                fileName: name,
                motionNames: [],
                enableMaterial: true,
                enableMorph: true,
                enablePhysics: true
            }
            return { models: { ...models } }
        })
        useGlobalStore.setState({ openMainUI: false })
    }

    return (
        <ResourceCard
            name={name}
            onClick={onClick}
            selected={false}
        >
            <MenuItem sx={{ color: 'red' }} onClick={() => onDelete(name)}>
                Delete Model
            </MenuItem>
        </ResourceCard>
    );
}

export default LocalModel;