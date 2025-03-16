import Model from "./Model";
import Morph from "../ModelHelper/Morph";
import Material from "../ModelHelper/Material";
import Physics from "../ModelHelper/Physics";
import Animation from "../ModelHelper/Animation";
import Bone from "../ModelHelper/Bone";

function Character() {
    return (
        <Model>
            <Morph></Morph>
            {/* <Bone></Bone> */}
            <Material></Material>
            <Physics></Physics>
            <Animation></Animation>
        </Model>
    );
}

export default Character;