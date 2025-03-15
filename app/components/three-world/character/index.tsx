import Model from "./Model";
import Morph from "../ModelHelper/Morph";
import Material from "../ModelHelper/Material";
import Physics from "../ModelHelper/Physics";
import Animation from "../ModelHelper/Animation";

function Character() {
    return (
        <Model>
            <Morph></Morph>
            <Material></Material>
            <Physics></Physics>
            <Animation></Animation>
        </Model>
    );
}

export default Character;