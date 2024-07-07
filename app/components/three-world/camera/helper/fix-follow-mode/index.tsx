import useGlobalStore from "@/app/stores/useGlobalStore";
import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import { Vector3 } from "three";


function FixFollowMode() {

    const controls = useGlobalStore(state => state.controls)
    const character = useGlobalStore(state => state.character)
    const isMotionUpdating = useGlobalStore(state => state.isMotionUpdating)
    const camera = useThree(state => state.camera)

    const getSmoothCenter = () => character.getObjectByName("smoothCenter").position

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

        if (!isOrbitControl.current) {
            camera.position.add(delta)
            camera.updateProjectionMatrix();
        }
    }
    useLayoutEffect(() => {
        if (!character || !controls) return
        controls.target = getSmoothCenter().clone()
        setTime()
    }, [character, controls])

    useFrame(() => {
        if (isMotionUpdating.current) setTime()
    }, 1)
    return <></>;
}

export default FixFollowMode;