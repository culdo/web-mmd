import Morph from "../ModelHelper/Morph";
import Material from "../ModelHelper/Material";
import Physics from "../ModelHelper/Physics";
import Animation from "../ModelHelper/Animation";
import WithModel from "../ModelHelper/WithModel";

function Helper() {
    return (
        <>
            <Morph></Morph>
            <Material></Material>
            <Physics></Physics>
            <Animation></Animation>
        </>
    );
}

export default WithModel(Helper, "character");