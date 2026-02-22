import { MouseEvent } from "react";
import ResourceCard from "../resources/ResourceCard";
import WithLocalMusics from "./WithLocalMusics";

function LocalMusic({ name }: { name: string }) {

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

export default WithLocalMusics(LocalMusic);