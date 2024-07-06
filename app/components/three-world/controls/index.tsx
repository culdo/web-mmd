import useGlobalStore from '@/app/stores/useGlobalStore';
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { OrbitControls } from "./orbit-controls";

function Controls() {
    const controlsRef = useRef<OrbitControlsImpl>()
    const camera = useThree(state => state.camera)
    const cwHelper = useGlobalStore(state => state.cwHelper)
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
        cwHelper.isOrbitControl = true;
    }

    const onEnd = () => {
        cwHelper.orbitCameraPos = camera.position;
        cwHelper.isOrbitControl = false;
    }
    return (
        <OrbitControls
            onPointerDown={onPointerDown}
            onStart={onStart} onEnd={onEnd}
            enableDamping={false}
            ref={controlsRef}
            makeDefault
        />
    );
}

export default Controls;