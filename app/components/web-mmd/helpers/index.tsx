import useGlobalStore from "@/app/stores/useGlobalStore";
import { useFrame } from '@react-three/fiber';
import { useRef } from "react";

function Helpers(): null {

    const { helper, cwHelper, api, player, runtimeCharacter, controls, loadCamera } = useGlobalStore()

    const prevTime = 0.0
    const prevTimeRef = useRef(prevTime)

    useFrame(() => {
        if (!runtimeCharacter || !loadCamera) {
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
            cwHelper.setTime(currTime);
            // character motion updating
            helper.update(delta, currTime);

            // check if time seeking using player control
            if (Math.abs(delta) > 0.1) {
                runtimeCharacter.physics.reset();
                helper.enable('physics', api['physics']);
            }
            prevTimeRef.current = currTime

        } else {
            if (controls.autoRotate) {
                controls.update();
            }
            if (api['physics']) {
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
    })
    return null;
}

export default Helpers;