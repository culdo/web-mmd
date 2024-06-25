import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { useFrame } from '@react-three/fiber';
import { useRef } from "react";

function useRenderLoop() {

    const helper = useGlobalStore(state => state.helper)
    const physics = usePresetStore(state => state.physics)
    const player = useGlobalStore(state => state.player)
    const runtimeCharacter = useGlobalStore(state => state.runtimeCharacter)
    const controls = useGlobalStore(state => state.controls)
    const loadCamera = useGlobalStore(state => state.loadCamera)
    const isMotionUpdating = useGlobalStore(state => state.isMotionUpdating)

    const prevTime = 0.0
    const prevTimeRef = useRef(prevTime)

    useFrame(() => {
        if (!runtimeCharacter || !loadCamera || !player) {
            return
        }

        const currTime = player.currentTime()
        // player has a bug that sometimes jump to end(duration)
        // so we just skip that frame
        if (player.currentTime() == player.duration()) {
            return
        }

        const delta = currTime - prevTimeRef.current;

        if (Math.abs(delta) > 0) {
            // check if time seeking using player control
            if (Math.abs(delta) > 0.1) {
                helper.enable('physics', false);
            }

            // camera motion updating
            isMotionUpdating.current = true
            // character motion updating
            helper.update(delta, currTime);

            // check if time seeking using player control
            if (Math.abs(delta) > 0.1) {
                runtimeCharacter.physics.reset();
                helper.enable('physics', physics);
            }
            prevTimeRef.current = currTime

        } else {
            isMotionUpdating.current = false
            if (controls.autoRotate) {
                controls.update();
            }
            if (physics) {
                runtimeCharacter.physics.update(delta);
            }
        }

        // stop when motion is finished and then fix physics
        if (runtimeCharacter.looped) {
            player.pause();
            player.currentTime(0.0);

            runtimeCharacter.physics.reset();
            runtimeCharacter.physics.update(0.1)

            runtimeCharacter.looped = false;
        }
    }, 0)
}

export default useRenderLoop;