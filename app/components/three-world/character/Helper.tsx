import Morph from "../ModelHelper/Morph";
import Material from "../ModelHelper/Material";
import Physics from "../ModelHelper/Physics";
import Animation from "../ModelHelper/Animation";
import Pose from "../ModelHelper/Pose";
import WithModel from "../ModelHelper/WithModel";

function Helper() {
    return (
        <>
            <Morph></Morph>
            <Material></Material>
            <Physics></Physics>
            <Animation></Animation>
            <Pose></Pose>
        </>
    );
}

export default WithModel(Helper, "character");