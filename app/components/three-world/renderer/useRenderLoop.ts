import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from "react";
import { OrbitControls } from "three-stdlib";

function useRenderLoop() {

    const player = useGlobalStore(state => state.player)
    const controls = useThree(state => state.controls) as OrbitControls
    const playAbsDeltaRef = useGlobalStore(state => state.playAbsDeltaRef)

    const prevTimeRef = useRef(0.0)
    useFrame(() => {
        if (!player) return

        const currTime = player.currentTime
        const absDelta = Math.abs(currTime - prevTimeRef.current);
        playAbsDeltaRef.current = absDelta

        if (absDelta > 0) {
            prevTimeRef.current = currTime

            // save seeked time
            if (absDelta > 1.0) {
                usePresetStore.setState({ currentTime: currTime })
            }

        } else {
            if (controls?.autoRotate) {
                controls.update();
            }
        }
    }, 1)
}

export default useRenderLoop;