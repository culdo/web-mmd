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
    const showGameMenu = useGlobalStore(state => state.showGameMenu)

    const getCenterPos = () => targetModel.getObjectByName("smoothCenter").getWorldPosition(centerPos.current)

    const deltaRef = useRef(new Vector3())
    const camDeltaRef = useRef(new Vector3())
    const controlsDeltaRef = useRef(new Vector3())
    const posDampRef = useRef(0.0)
    const cameraLimiterRef = useRef(new Vector3())
    const targetLimiterRef = useRef(new Vector3())
    const diffLengthRef = useRef(new Vector3())

    useEffect(() => {
        const position = getCenterPos()
        cameraLimiterRef.current.subVectors(camera.position, position)
        targetLimiterRef.current.subVectors(controls.target, position)
    }, [])

    useEffect(() => {
        if (!showGameMenu) return
        const camOrig = cameraLimiterRef.current.clone()
        cameraLimiterRef.current.set(
            3.4469485287688677,
            10.141209011110533,
            11.1089944892801,
        )
        cameraLimiterRef.current.applyAxisAngle(_yAxis, targetModel.rotation.y)
        const targetOrig = targetLimiterRef.current.clone()
        targetLimiterRef.current.set(
            -3.379365763119596,
            8.313937683218128,
            -0.9115918994124408,
        )
        targetLimiterRef.current.applyAxisAngle(_yAxis, targetModel.rotation.y)
        return () => {
            cameraLimiterRef.current = camOrig
            targetLimiterRef.current = targetOrig
        }
    }, [showGameMenu])

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

            const camDelta = camDeltaRef.current
            const controlsDelta = controlsDeltaRef.current
            camDelta.subVectors(camera.position, position)
            controlsDelta.subVectors(controls.target, position)

            cameraLimiterRef.current.applyAxisAngle(_yAxis, rotDelta)
            targetLimiterRef.current.applyAxisAngle(_yAxis, rotDelta)

            const diffLength = diffLengthRef.current.subVectors(camDelta, cameraLimiterRef.current).length()
            const diffWeight = diffLength == 0 ? 0 : 1 - MathUtils.damp(diffLength, 0.0, 2.0, dt) / diffLength

            camDelta.lerp(cameraLimiterRef.current, diffWeight)
            controlsDelta.lerp(targetLimiterRef.current, diffWeight)

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