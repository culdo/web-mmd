import useGlobalStore from '@/app/stores/useGlobalStore';
import { TransformControls } from '@react-three/drei';
import { useThree } from "@react-three/fiber";
import { levaStore } from 'leva';
import { useEffect, useRef } from "react";
import { Event } from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { OrbitControls } from "./orbit-controls";

function Controls() {
    const controlsRef = useRef<OrbitControlsImpl>()
    const camera = useThree(state => state.camera)
    const scene = useThree(state => state.scene)
    const isOrbitControl = useGlobalStore(state => state.isOrbitControl)
    const selectedName = useGlobalStore(state => state.selectedName)

    useEffect(() => {
        const controls = controlsRef.current
        useGlobalStore.setState({
            controls
        })

    }, [])

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
    
    const onObjectChange = (e: Event<string, any>) => {
        const pos = e.target.object.position.toArray()
        levaStore.set(Object.fromEntries([[selectedName, pos]]), false)
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
            {selectedName && <TransformControls onObjectChange={onObjectChange} object={scene.getObjectByName(selectedName)} mode="translate" />}
        </>
    );
}

export default Controls;