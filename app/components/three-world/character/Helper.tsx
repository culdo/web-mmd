import WithSuspense from "../../suspense";
import useAnimation from "./useAnimation";
import Model from "./Model";
import usePose from "./usePose";
import usePhysics from "./usePhysics";

function Helper() {
        usePhysics()
        useAnimation()
        usePose()
    return <></>;
}

export default WithSuspense(Helper);