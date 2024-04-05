import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import useGlobalStore from '@/app/stores/useGlobalStore';

function Controls() {
    const controlsRef = useRef<OrbitControlsImpl>()
    useEffect(() => {
        useGlobalStore.setState({
            controls: controlsRef.current
        })
    }, [controlsRef.current])
    return (
        <OrbitControls ref={controlsRef}></OrbitControls>
    );
}

export default Controls;