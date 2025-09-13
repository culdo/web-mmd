import useGlobalStore from "@/app/stores/useGlobalStore";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { MathUtils, PerspectiveCamera, Vector3 } from "three";
import { useModel } from "../../../model/helper/ModelContext";
import WithModel from "../../../model/helper/WithModel";
import { OrbitControls } from "three-stdlib";

const _yAxis = new Vector3(0, 1, 0)
function GameMode() {
    const camera = useThree(state => state.camera) as PerspectiveCamera
    const controls = useThree(state => state.controls) as OrbitControls

    const targetModel = useModel()

    const prevCenterPos = useRef(new Vector3())
    const centerPos = useRef(new Vector3())
    const prevRot = useRef(0.0)
    const isOrbitControlRef = useGlobalStore(state => state.isOrbitControlRef)

    const getCenterPos = () => targetModel.getObjectByName("smoothCenter").getWorldPosition(centerPos.current)

    const deltaRef = useRef(new Vector3())
    const camDeltaRef = useRef(new Vector3())
    const controlsDeltaRef = useRef(new Vector3())
    const posDampRef = useRef(0.0)
    const rotDampRef = useRef(0.0)
    const cameraLimiterRef = useRef(new Vector3())
    const targetLimiterRef = useRef(new Vector3())

    cameraLimiterRef.current.subVectors(camera.position, getCenterPos())
    targetLimiterRef.current.subVectors(controls.target, getCenterPos())

    const update = (dt = 0.0) => {
        const position = getCenterPos()

        const delta = deltaRef.current
        delta.subVectors(position, prevCenterPos.current)
        prevCenterPos.current.copy(position)

        posDampRef.current = MathUtils.damp(posDampRef.current, delta.length(), 2.0, dt)
        delta.normalize().multiplyScalar(posDampRef.current)

        controls.target.add(delta)

        if (isOrbitControlRef.current) {
            cameraLimiterRef.current.subVectors(camera.position, position)
            targetLimiterRef.current.subVectors(controls.target, position)
        } else {
            camera.position.add(delta)

            const rotDelta = targetModel.rotation.y - prevRot.current
            prevRot.current = targetModel.rotation.y
            rotDampRef.current = MathUtils.damp(rotDampRef.current, rotDelta, 5.0, dt)

            const camDelta = camDeltaRef.current
            const controlsDelta = controlsDeltaRef.current
            camDelta.subVectors(camera.position, position)
            controlsDelta.subVectors(controls.target, position)

            cameraLimiterRef.current.applyAxisAngle(_yAxis, rotDampRef.current)
            targetLimiterRef.current.applyAxisAngle(_yAxis, rotDampRef.current)

            const camDamp = MathUtils.damp(camDelta.length(), cameraLimiterRef.current.length(), 2.0, dt)
            const targetDamp = MathUtils.damp(controlsDelta.length(), targetLimiterRef.current.length(), 2.0, dt)

            camDelta.copy(cameraLimiterRef.current).normalize().multiplyScalar(camDamp)
            controlsDelta.copy(targetLimiterRef.current).normalize().multiplyScalar(targetDamp)

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

export default WithModel(GameMode);