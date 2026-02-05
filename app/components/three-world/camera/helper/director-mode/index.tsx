import Director from "./Director";
import FixFollowing from "../fix-following-mode";
import { WithTargetModel } from "../../../model/helper/useTargetModel";

function DirectorMode() {
    return (
        <>
            <Director />
            <FixFollowing />
        </>
    );
}

export default WithTargetModel(DirectorMode);