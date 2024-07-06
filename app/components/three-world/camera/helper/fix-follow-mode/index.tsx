import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { onProgress } from "@/app/utils/base";
import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, use, useLayoutEffect, useMemo, useRef } from "react";
import { AnimationClip, AnimationMixer, Vector3 } from "three";


function FixFollowMode() {

    const controls = useGlobalStore(state => state.controls)
    const character = useGlobalStore(state => state.character)
    const isMotionUpdating = useGlobalStore(state => state.isMotionUpdating)
    const camera = useThree(state => state.camera)

    const getSmoothCenter = ()  => character.getObjectByName("smoothCenter").position

    const prevCenterPos = useRef(getSmoothCenter().clone())
    const isOrbitControl = useGlobalStore(state => state.isOrbitControl)
    
    const setTime = () => {
        const position = getSmoothCenter()
    
        const delta = new Vector3()
        delta.subVectors(position, prevCenterPos.current)

        prevCenterPos.current.copy(position)

        controls.target.add(delta)

        if (!isOrbitControl.current) {
            camera.lookAt(controls.target);
            camera.position.add(delta)
            camera.updateProjectionMatrix();
        }
    }
    useLayoutEffect(() => {
        setTime()
    }, [])

    useFrame(() => {
        if (isMotionUpdating.current) setTime()
    }, 0)
    return <></>;
}

export default FixFollowMode;