import useGlobalStore from "@/app/stores/useGlobalStore";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { MathUtils, PerspectiveCamera, Quaternion, Spherical, Vector3 } from "three";
import { useModel } from "../../../model/helper/ModelContext";
import WithModel from "../../../model/helper/WithModel";
import { OrbitControls } from "three-stdlib";

function FixFollowMode() {
    const camera = useThree(state => state.camera) as PerspectiveCamera
    const controls = useThree(state => state.controls) as OrbitControls

    const targetModel = useModel()

    const prevCenterPos = useRef(new Vector3())
    const isOrbitControlRef = useGlobalStore(state => state.isOrbitControlRef)
    const cameraOffset = useGlobalStore(state => state.cameraPose)

    const getCenterPos = () => targetModel.skeleton.getBoneByName("センター").getWorldPosition(cameraOffset.center)

    const targetWeight = useRef(new Vector3())
    const currentPosRef = useRef(new Vector3())
    const currentTargetRef = useRef(new Vector3())
    const camDeltaRef = useRef(new Vector3())
    const targetDeltaRef = useRef(new Vector3())
    const desiredPosRef = useRef(new Vector3())
    const desiredTargetRef = useRef(new Vector3())
    
    const sphericalRef = useRef(new Spherical())
    const sphericalDeltaRef = useRef(new Spherical())
    const sphericalTempRef = useRef(new Spherical())
    const dampingFactor = 0.2

    useEffect(() => {
        const position = getCenterPos()
        if(cameraOffset.position.length() == 0) cameraOffset.position.subVectors(camera.position, position)
        if(cameraOffset.target.length() == 0) cameraOffset.target.subVectors(controls.target, position)
    }, [])

    const update = (dt = 0.0) => {
        const centerPos = getCenterPos()

        if (isOrbitControlRef.current) {
            cameraOffset.position.subVectors(camera.position, controls.target).applyQuaternion(targetModel.quaternion.invert())
            cameraOffset.target.subVectors(controls.target, centerPos).applyQuaternion(targetModel.quaternion.invert())
        } else {

            const posOffset = currentPosRef.current
            const targetOffset = currentTargetRef.current

            posOffset.subVectors(camera.position, controls.target)
            targetOffset.subVectors(controls.target, centerPos)
            
            const desiredPosOffset = desiredPosRef.current
            const desiredTargetOffset = desiredTargetRef.current

            desiredPosOffset.copy(cameraOffset.position)
            desiredTargetOffset.copy(cameraOffset.target)
            desiredPosOffset.applyQuaternion(targetModel.quaternion)
            desiredTargetOffset.applyQuaternion(targetModel.quaternion)

            const spherical = sphericalRef.current
            const sphericalTemp = sphericalTempRef.current

            spherical.setFromVector3(posOffset)
            sphericalTemp.setFromVector3(desiredPosOffset)
            let thetaDelta = sphericalTemp.theta - spherical.theta
            let phiDelta = sphericalTemp.phi - spherical.phi
            
            if(Math.abs(thetaDelta) > Math.PI) {
                thetaDelta += 2 * Math.PI * -Math.sign(thetaDelta)
            }
            if(Math.abs(phiDelta) > Math.PI) {
                phiDelta += 2 * Math.PI * -Math.sign(phiDelta)
            }

            const deltaLength = targetWeight.current.subVectors(posOffset, desiredPosRef.current).length()
            const deltaWeight = deltaLength == 0 ? 0 : 1 - MathUtils.damp(deltaLength, 0.0, 2.0, dt) / deltaLength

            spherical.theta = MathUtils.lerp(spherical.theta, spherical.theta + thetaDelta, deltaWeight)
			spherical.phi = MathUtils.lerp(spherical.phi, spherical.phi + phiDelta, deltaWeight)
			spherical.radius = MathUtils.lerp(spherical.radius, sphericalTemp.radius, deltaWeight)
            spherical.makeSafe()
            
            posOffset.setFromSpherical(spherical)

            targetOffset.lerp(desiredTargetRef.current, deltaWeight)
            
            controls.target.addVectors(centerPos, targetOffset)
            camera.position.addVectors(controls.target, posOffset)

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