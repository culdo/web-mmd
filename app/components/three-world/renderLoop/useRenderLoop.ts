import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { useFrame } from '@react-three/fiber';
import { useRef } from "react";

function useRenderLoop() {

    const helper = useGlobalStore(state => state.helper)
    const player = useGlobalStore(state => state.player)
    const runtimeCharacter = useGlobalStore(state => state.runtimeCharacter)
    const controls = useGlobalStore(state => state.controls)
    const isMotionUpdating = useGlobalStore(state => state.isMotionUpdating)

    const prevTimeRef = useRef(0.0)
    
    useFrame(() => {
        if (!runtimeCharacter || !player) {
            return
        }

        const currTime = player.currentTime
        const delta = currTime - prevTimeRef.current;

        if (Math.abs(delta) > 0) {
            // camera motion updating
            isMotionUpdating.current = true
            // character motion updating
            helper.update(delta, currTime);
            prevTimeRef.current = currTime

            // save seeked time
            if (Math.abs(delta) > 1.0) {
                usePresetStore.setState({currentTime: currTime})
            }

        } else {
            isMotionUpdating.current = false
            if (controls.autoRotate) {
                controls.update();
            }
            if (helper.enabled["physics"]) {
                runtimeCharacter.physics.update(delta);
            }
        }

        // stop when motion is finished
        if (runtimeCharacter.looped) {
            player.currentTime = 0.0
            player.pause()
            runtimeCharacter.looped = false
        }
    }, 1)
}

export default useRenderLoop;