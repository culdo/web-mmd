import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from "react";
import { OrbitControls } from "three-stdlib";

function useRenderLoop() {

    const player = useGlobalStore(state => state.player)
    const controls = useThree(state => state.controls) as OrbitControls
    const playDeltaRef = useGlobalStore(state => state.playDeltaRef)


    const prevTimeRef = useRef(0.0)
    useFrame(() => {
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
                usePresetStore.setState({ currentTime: currTime })
            }

        } else {
            if (controls.autoRotate) {
                controls.update();
            }
        }
    }, 1)
}

export default useRenderLoop;