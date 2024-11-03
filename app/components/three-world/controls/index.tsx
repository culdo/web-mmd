import useGlobalStore from '@/app/stores/useGlobalStore';
import { TransformControls } from '@react-three/drei';
import { useThree } from "@react-three/fiber";
import { levaStore } from 'leva';
import { useEffect, useRef } from "react";
import { Event, PerspectiveCamera } from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { OrbitControls } from "./orbit-controls";
import { setLevaValue } from '@/app/utils/gui';

function Controls() {
    const controlsRef = useRef<OrbitControlsImpl>()
    const camera = useThree(state => state.camera) as PerspectiveCamera
    const scene = useThree(state => state.scene)
    const gl = useThree(state => state.gl)
    const isOrbitControl = useGlobalStore(state => state.isOrbitControl)
    const isTransformControl = useGlobalStore(state => state.isTransformControl)
    const selectedName = useGlobalStore(state => state.selectedName)
    const enabledTransform = useGlobalStore(state => state.enabledTransform)

    useEffect(() => {
        const controls = controlsRef.current
        useGlobalStore.setState({
            controls
        })

    }, [])

    const onWheel = (event: WheelEvent) => {
        if (event.shiftKey) {
            if (event.deltaX > 0) {
                camera.fov *= 1.05
            } else {
                camera.fov *= 0.95
            }
            camera.updateProjectionMatrix()
            setLevaValue("Camera.fov", camera.fov)
        }
    }

    useEffect(() => {
        gl.domElement.addEventListener('wheel', onWheel)
        return () => gl.domElement.removeEventListener('wheel', onWheel)
    }, [camera])

    const onPointerDown = () => {
        camera.up.set(0, 1, 0);
        camera.updateProjectionMatrix();
    }

    const onStart = () => {
        isOrbitControl.current = true
    }

    const onEnd = () => {
        isOrbitControl.current = false
    }

    const onStartTc = () => {
        isTransformControl.current = true
    }

    const onEndTc = () => {
        isTransformControl.current = false
    }

    const onObjectChange = (e: Event<string, any>) => {
        const pos = e.target.object.position.toArray()
        if (levaStore.get(selectedName)) {
            levaStore.set({ [selectedName]: pos }, false)
        } else if (e.target.object.userData.physicsBody) {
            const rigidBody = e.target.object.userData.physicsBody
            // get
            const ms = rigidBody.getMotionState()
            const transform = new Ammo.btTransform();
            ms.getWorldTransform(transform)
            // set
            transform.setOrigin(new Ammo.btVector3(pos[0], pos[1], pos[2]))
            ms.setWorldTransform(transform)
            rigidBody.setMotionState(ms)
        }
    }
    return (
        <>
            <OrbitControls
                onPointerDown={onPointerDown}
                onStart={onStart} onEnd={onEnd}
                enableDamping={false}
                ref={controlsRef}
                makeDefault
            />
            {selectedName && enabledTransform && <TransformControls onMouseDown={onStartTc} onMouseUp={onEndTc} onObjectChange={onObjectChange} object={scene.getObjectByName(selectedName)} mode="translate" />}
        </>
    );
}

export default Controls;