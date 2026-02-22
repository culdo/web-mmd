import { MouseEvent } from "react";
import ResourceCard from "../resources/ResourceCard";
import WithLocalCameras from "./WithLocalCameras";

function LocalCamera({ name }: { name: string }) {

    const onClick = (e: MouseEvent) => {
        
    }

    return (
        <ResourceCard
            name={name}
            onClick={onClick}
            selected={false}
        >
        </ResourceCard>
    );
}

export default WithLocalCameras(LocalCamera);