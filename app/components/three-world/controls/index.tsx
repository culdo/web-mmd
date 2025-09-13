import useGlobalStore from '@/app/stores/useGlobalStore';
import { TransformControls } from '@react-three/drei';
import { useThree } from "@react-three/fiber";
import { levaStore } from 'leva';
import { useEffect, useRef } from "react";
import { Event, PerspectiveCamera } from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { setLevaValue } from '@/app/utils/gui';
import { OrbitControls } from './orbit-controls';

function Controls() {
    const controlsRef = useRef<OrbitControlsImpl>()
    const camera = useThree(state => state.camera) as PerspectiveCamera
    const scene = useThree(state => state.scene)
    const gl = useThree(state => state.gl)
    const isTransformControl = useGlobalStore(state => state.isTransformControlRef)
    const selectedName = useGlobalStore(state => state.selectedName)
    const enabledTransform = useGlobalStore(state => state.enabledTransform)

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

    const onChange = () => {
        camera.up.set(0, 1, 0);
        camera.updateProjectionMatrix();
    }

    const onStart = () => {
        useGlobalStore.setState({isOrbitControl: true})
    }

    const onEnd = () => {
        useGlobalStore.setState({isOrbitControl: false})

        // studio.transaction(({set}) => {
        //     set(cameraObj.props.position.x, camera.position.x)
        //     set(cameraObj.props.position.y, camera.position.y)
        //     set(cameraObj.props.position.z, camera.position.z)
        //     set(cameraObj.props.rotation.x, camera.rotation.x)
        //     set(cameraObj.props.rotation.y, camera.rotation.y)
        //     set(cameraObj.props.rotation.z, camera.rotation.z)
        // })
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
                onChange={onChange}
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