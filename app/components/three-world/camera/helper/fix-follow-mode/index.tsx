import useGlobalStore from "@/app/stores/useGlobalStore";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { PerspectiveCamera, Vector3 } from "three";
import { useModel } from "../../../model/helper/ModelContext";
import WithModel from "../../../model/helper/WithModel";
import { OrbitControls } from "three-stdlib";

function FixFollowMode() {
    const camera = useThree(state => state.camera) as PerspectiveCamera
    const controls = useThree(state => state.controls) as OrbitControls
    
    const targetModel = useModel()

    const isMotionUpdating = useGlobalStore(state => state.isMotionUpdating)

    const getSmoothCenter = () => targetModel.getObjectByName("smoothCenter").position

    const prevCenterPos = useRef(null)
    const isOrbitControlRef = useGlobalStore(state => state.isOrbitControlRef)

    const setTime = () => {
        const position = getSmoothCenter().clone()
        if (!prevCenterPos.current) {
            prevCenterPos.current = position.clone()
        }

        const delta = new Vector3()
        delta.subVectors(position, prevCenterPos.current)

        prevCenterPos.current.copy(position)

        controls.target.add(delta)

        if (!isOrbitControlRef.current) {
            camera.position.add(delta)
            camera.updateProjectionMatrix()
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