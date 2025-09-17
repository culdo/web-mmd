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
    const centerPos = useRef(new Vector3())
    const prevRot = useRef(targetModel.quaternion.clone())
    const isOrbitControlRef = useGlobalStore(state => state.isOrbitControlRef)
    const cameraPose = useGlobalStore(state => state.cameraPose)

    const getCenterPos = () => targetModel.getObjectByName("smoothCenter").getWorldPosition(centerPos.current)

    const deltaRef = useRef(new Vector3())
    const camDeltaRef = useRef(new Vector3())
    const controlsDeltaRef = useRef(new Vector3())
    const posDampRef = useRef(0.0)
    const diffLengthRef = useRef(new Vector3())

    useEffect(() => {
        const position = getCenterPos()
        cameraPose.position.subVectors(camera.position, position)
        cameraPose.target.subVectors(controls.target, position)
    }, [])

    const update = (dt = 0.0) => {
        const position = getCenterPos()

        const delta = deltaRef.current
        delta.subVectors(position, prevCenterPos.current)
        prevCenterPos.current.copy(position)

        posDampRef.current = MathUtils.damp(posDampRef.current, delta.length(), 2.0, dt)
        delta.normalize().multiplyScalar(posDampRef.current)

        controls.target.add(delta)

        if (isOrbitControlRef.current) {
            cameraPose.position.subVectors(camera.position, position)
            cameraPose.target.subVectors(controls.target, position)
        } else {
            camera.position.add(delta)

            const camDelta = camDeltaRef.current
            const controlsDelta = controlsDeltaRef.current
            camDelta.subVectors(camera.position, position)
            controlsDelta.subVectors(controls.target, position)

            const rotDelta = prevRot.current.clone().invert().multiply(targetModel.quaternion)
            prevRot.current.copy(targetModel.quaternion)
            
            cameraPose.position.applyQuaternion(rotDelta)
            cameraPose.target.applyQuaternion(rotDelta)

            const diffLength = diffLengthRef.current.subVectors(camDelta, cameraPose.position).length()
            const diffWeight = diffLength == 0 ? 0 : 1 - MathUtils.damp(diffLength, 0.0, 2.0, dt) / diffLength

            camDelta.lerp(cameraPose.position, diffWeight)
            controlsDelta.lerp(cameraPose.target, diffWeight)

            camera.position.addVectors(position, camDelta)
            controls.target.addVectors(position, controlsDelta)

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