import useGlobalStore from "@/app/stores/useGlobalStore";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { MathUtils, PerspectiveCamera, Quaternion, Vector3 } from "three";
import { useModel } from "../../../model/helper/ModelContext";
import WithModel from "../../../model/helper/WithModel";
import { OrbitControls } from "three-stdlib";

function FixFollowMode() {
    const camera = useThree(state => state.camera) as PerspectiveCamera
    const controls = useThree(state => state.controls) as OrbitControls

    const targetModel = useModel()

    const prevCenterPos = useRef(new Vector3())
    const isOrbitControlRef = useGlobalStore(state => state.isOrbitControlRef)
    const cameraPose = useGlobalStore(state => state.cameraPose)

    const getCenterPos = () => targetModel.skeleton.getBoneByName("センター").getWorldPosition(cameraPose.center)

    const deltaRef = useRef(new Vector3())
    const camDeltaRef = useRef(new Vector3())
    const controlsDeltaRef = useRef(new Vector3())
    const posDampRef = useRef(0.0)
    const diffLengthRef = useRef(new Vector3())
    const desiredPosRef = useRef(new Vector3())
    const desiredTargetRef = useRef(new Vector3())

    useEffect(() => {
        const position = getCenterPos()
        if(cameraPose.position.length() == 0) cameraPose.position.subVectors(camera.position, position)
        if(cameraPose.target.length() == 0) cameraPose.target.subVectors(controls.target, position)
    }, [])

    const update = (dt = 0.0) => {
        const centerPos = getCenterPos()

        const delta = deltaRef.current
        delta.subVectors(centerPos, prevCenterPos.current)
        prevCenterPos.current.copy(centerPos)

        posDampRef.current = MathUtils.damp(posDampRef.current, delta.length(), 2.0, dt)
        delta.normalize().multiplyScalar(posDampRef.current)

        controls.target.add(delta)

        if (isOrbitControlRef.current) {
            cameraPose.position.subVectors(camera.position, centerPos)
            cameraPose.target.subVectors(controls.target, centerPos)
        } else {
            camera.position.add(delta)

            const camDelta = camDeltaRef.current
            const controlsDelta = controlsDeltaRef.current
            camDelta.subVectors(camera.position, centerPos)
            controlsDelta.subVectors(controls.target, centerPos)
            
            desiredPosRef.current.copy(cameraPose.position)
            desiredTargetRef.current.copy(cameraPose.target)
            desiredPosRef.current.applyQuaternion(targetModel.quaternion)
            desiredTargetRef.current.applyQuaternion(targetModel.quaternion)

            const diffLength = diffLengthRef.current.subVectors(camDelta, desiredPosRef.current).length()
            const diffWeight = diffLength == 0 ? 0 : 1 - MathUtils.damp(diffLength, 0.0, 2.0, dt) / diffLength

            camDelta.lerp(desiredPosRef.current, diffWeight)
            controlsDelta.lerp(desiredTargetRef.current, diffWeight)

            camera.position.addVectors(centerPos, camDelta)
            controls.target.addVectors(centerPos, controlsDelta)

            camera.updateProjectionMatrix()
            camera.lookAt(controls.target)
        }
    }

    useEffect(() => {
        if (!targetModel || !controls) return
        controls.target.copy(getCenterPos())
        update()
    }, [targetModel, controls])

    useFrame((_, delta) => {
        update(delta)
    }, 1)
    return <></>;
}

export default WithModel(FixFollowMode);