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
    const isOrbitControl = useGlobalStore(state => state.isOrbitControl)

    const getCenterPos = () => targetModel.getObjectByName("smoothCenter").getWorldPosition(centerPos.current)

    const deltaRef = useRef(new Vector3())
    const camDeltaRef = useRef(new Vector3())
    const controlsDeltaRef = useRef(new Vector3())
    const posDampRef = useRef(0.0)
    const rotDampRef = useRef(0.0)

    const update = (dt = 0.0) => {
        const position = getCenterPos()

        const delta = deltaRef.current
        delta.subVectors(position, prevCenterPos.current)

        posDampRef.current = MathUtils.damp(posDampRef.current, delta.length(), 5.0, dt)
        delta.normalize().multiplyScalar(posDampRef.current)

        prevCenterPos.current.copy(position)
        controls.target.add(delta)

        if (!isOrbitControl) {
            camera.position.add(delta)

            const rotDelta = targetModel.rotation.y - prevRot.current
            rotDampRef.current = MathUtils.damp(rotDampRef.current, rotDelta, 5.0, dt)

            const camDelta = camDeltaRef.current
            const controlsDelta = controlsDeltaRef.current
            camDelta.subVectors(camera.position, getCenterPos())
            controlsDelta.subVectors(controls.target, getCenterPos())
            
            camDelta.applyAxisAngle(_yAxis, rotDampRef.current)
            controlsDelta.applyAxisAngle(_yAxis, rotDampRef.current)
            
            camera.position.addVectors(getCenterPos(), camDelta)
            controls.target.addVectors(getCenterPos(), controlsDelta)

            prevRot.current = targetModel.rotation.y

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