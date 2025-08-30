import useGlobalStore from "@/app/stores/useGlobalStore";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";
import WithModel from "../../../model/helper/WithModel";
import usePresetStore from "@/app/stores/usePresetStore";

function FixFollowMode() {
    const controls = useGlobalStore(state => state.controls)
    const targetModelId = usePresetStore(state => state.targetModelId)
    const targetModel = useGlobalStore(state => state.models)[targetModelId]
    const isMotionUpdating = useGlobalStore(state => state.isMotionUpdating)
    const camera = useThree(state => state.camera)

    const getSmoothCenter = () => targetModel.getObjectByName("smoothCenter").position

    const prevCenterPos = useRef(null)
    const isOrbitControl = useGlobalStore(state => state.isOrbitControl)

    const setTime = () => {
        const position = getSmoothCenter().clone()
        if(!prevCenterPos.current) {
            prevCenterPos.current = position.clone()
        }

        const delta = new Vector3()
        delta.subVectors(position, prevCenterPos.current)

        prevCenterPos.current.copy(position)

        controls.target.add(delta)

        if (!isOrbitControl) {
            camera.position.add(delta)
            camera.updateProjectionMatrix();
        }
    }
    useEffect(() => {
        if (!targetModel || !controls) return
        controls.target = getSmoothCenter().clone()
        setTime()
    }, [targetModel, controls])

    useFrame(() => {
        if (isMotionUpdating()) setTime()
    }, 1)
    return <></>;
}

export default WithModel(FixFollowMode);