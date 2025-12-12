import Director from "./Director";
import FixFollowing from "../fix-following-mode";
import WithModel from "../../../model/helper/WithModel";

function DirectorMode() {
    return (
        <>
            <Director />
            <FixFollowing />
        </>
    );
}

export default WithModel(DirectorMode);