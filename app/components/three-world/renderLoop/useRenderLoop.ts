import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { useFrame } from '@react-three/fiber';
import { useRef } from "react";

function useRenderLoop() {

    const player = useGlobalStore(state => state.player)
    const controls = useGlobalStore(state => state.controls)
    const playDeltaRef = useGlobalStore(state => state.playDeltaRef)
    const isWebGPU = usePresetStore(state => state.isWebGPU)


    const prevTimeRef = useRef(0.0)
    
    useFrame(({gl, scene, camera}) => {
        if (!player) return

        const currTime = player.currentTime
        const delta = currTime - prevTimeRef.current;
        playDeltaRef.current = delta
        const absDelta = Math.abs(delta)

        if (absDelta > 0) {
            // camera motion updating
            prevTimeRef.current = currTime

            // save seeked time
            if (absDelta > 1.0) {
                usePresetStore.setState({currentTime: currTime})
            }

        } else {
            if (controls.autoRotate) {
                controls.update();
            }
        }
        
        if(isWebGPU) {
            gl.render(scene, camera)
        }
    }, 1)
}

export default useRenderLoop;