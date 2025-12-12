import useGlobalStore from "@/app/stores/useGlobalStore";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { MathUtils, PerspectiveCamera, Spherical, Vector3 } from "three";
import { useModel } from "../../../model/helper/ModelContext";
import { OrbitControls } from "three-stdlib";
import WithModel from "../../../model/helper/WithModel";

function FixFollowing() {
    const camera = useThree(state => state.camera) as PerspectiveCamera
    const controls = useThree(state => state.controls) as OrbitControls
    const targetRef = useRef(controls?.target ?? new Vector3())

    const targetModel = useModel()

    const isOrbitControlRef = useGlobalStore(state => state.isOrbitControlRef)
    const cameraOffset = useGlobalStore(state => state.cameraOffset)

    const getCenterPos = () => targetModel.skeleton.getBoneByName("上半身").getWorldPosition(cameraOffset.center)

    const tempWeight = useRef(new Vector3()).current

    const posOffset = useRef(new Vector3()).current
    const targetOffset = useRef(new Vector3()).current
    const desiredPosOffset = useRef(new Vector3()).current
    const desiredTargetOffset = useRef(new Vector3()).current
    const spherical = useRef(new Spherical()).current
    const desiredSpherical = useRef(new Spherical()).current

    useEffect(() => {
        const position = getCenterPos()
        targetRef.current = controls?.target ?? new Vector3()
        targetRef.current.copy(position)

        if(cameraOffset.position.length() == 0) cameraOffset.position.subVectors(camera.position, position)
        if(cameraOffset.target.length() == 0) cameraOffset.target.subVectors(targetRef.current, position)
    }, [controls])

    const update = (dt = 0.0) => {
        const centerPos = getCenterPos()

        if (isOrbitControlRef.current) {
            cameraOffset.position.subVectors(camera.position, targetRef.current).applyQuaternion(targetModel.quaternion.invert())
            cameraOffset.target.subVectors(targetRef.current, centerPos).applyQuaternion(targetModel.quaternion.invert())
        } else {

            posOffset.subVectors(camera.position, targetRef.current)
            targetOffset.subVectors(targetRef.current, centerPos)

            desiredPosOffset.copy(cameraOffset.position)
            desiredTargetOffset.copy(cameraOffset.target)
            desiredPosOffset.applyQuaternion(targetModel.quaternion)
            desiredTargetOffset.applyQuaternion(targetModel.quaternion)

            spherical.setFromVector3(posOffset)
            desiredSpherical.setFromVector3(desiredPosOffset)
            let thetaDelta = desiredSpherical.theta - spherical.theta
            let phiDelta = desiredSpherical.phi - spherical.phi
            
            if(Math.abs(thetaDelta) > Math.PI) {
                thetaDelta += 2 * Math.PI * -Math.sign(thetaDelta)
            }
            if(Math.abs(phiDelta) > Math.PI) {
                phiDelta += 2 * Math.PI * -Math.sign(phiDelta)
            }

            const posLength = tempWeight.subVectors(posOffset, desiredPosOffset).length()
            const posWeight = posLength == 0 ? 0 : 1 - MathUtils.damp(posLength, 0.0, cameraOffset.dampingFactor, dt) / posLength

            spherical.theta = MathUtils.lerp(spherical.theta, spherical.theta + thetaDelta, posWeight)
			spherical.phi = MathUtils.lerp(spherical.phi, spherical.phi + phiDelta, posWeight)
			spherical.radius = MathUtils.lerp(spherical.radius, desiredSpherical.radius, posWeight)
            spherical.makeSafe()
            
            posOffset.setFromSpherical(spherical)

            const targetLength = tempWeight.subVectors(targetOffset, desiredTargetOffset).length()
            const targetWeight = targetLength == 0 ? 0 : 1 - MathUtils.damp(targetLength, 0.0, cameraOffset.dampingFactor, dt) / targetLength
            targetOffset.lerp(desiredTargetOffset, targetWeight)

            const rotLength = tempWeight.subVectors(camera.up, cameraOffset.up).length()
            const rotWeight = rotLength == 0 ? 0 : 1 - MathUtils.damp(rotLength, 0.0, cameraOffset.dampingFactor, dt) / rotLength
            camera.up.lerp(cameraOffset.up, rotWeight)
            
            targetRef.current.addVectors(centerPos, targetOffset)
            camera.position.addVectors(targetRef.current, posOffset)

            camera.updateProjectionMatrix()
            camera.lookAt(targetRef.current)
        }
    }

    useFrame((_, delta) => {
        update(delta)
    }, 1)
    return <></>;
}

export default WithModel(FixFollowing);