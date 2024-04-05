import { MMDAnimationHelper } from "@/app/modules/MMDAnimationHelper";
import { MMDCameraWorkHelper } from "@/app/modules/MMDCameraWorkHelper";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { useEffect } from "react";

function useHelpers() {
    useEffect(() => {
        const helper = new MMDAnimationHelper()
        const cwHelper = new MMDCameraWorkHelper()

        useGlobalStore.setState({
            helper,
            cwHelper
        })
    }, [])
}

export default useHelpers;