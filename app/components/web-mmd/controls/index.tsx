import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import useGlobalStore from '@/app/stores/useGlobalStore';
import { useThree } from "@react-three/fiber";

function Controls() {
    const controlsRef = useRef<OrbitControlsImpl>()
    const { camera } = useThree()
    const { cwHelper } = useGlobalStore()
    useEffect(() => {
        const controls = controlsRef.current
        if (!controls) return
        useGlobalStore.setState({
            controls
        })

        controls.domElement.addEventListener('mousedown', () => {
            camera.up.set(0, 1, 0);
            camera.updateProjectionMatrix();
        });

    }, [controlsRef.current, cwHelper])

    const onStart = () => {
        cwHelper.isOrbitControl = true;
    }

    const onEnd = () => {
        cwHelper.orbitCameraPos = camera.position;
        cwHelper.isOrbitControl = false;
    }
    return (
        <OrbitControls onStart={onStart} onEnd={onEnd} enableDamping={false} ref={controlsRef}></OrbitControls>
    );
}

export default Controls;