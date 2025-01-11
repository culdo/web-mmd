import useGlobalStore from "@/app/stores/useGlobalStore";
import useVMD from "../animation/useAnimation";
import usePresetStore from "@/app/stores/usePresetStore";
import { AnimationMixer } from "three";
import { useEffect, useMemo } from "react";

function Animation() {
    const runtimeCharacter = useGlobalStore(state => state.runtimeCharacter)
    const character = useGlobalStore(state => state.character)
    const motionFile = usePresetStore(state => state.motionFile)
    
    const mixer = useMemo(() => new AnimationMixer(character), [character]);
    
    useVMD(character, mixer, motionFile)

    useEffect(() => {
        mixer.addEventListener('loop', () => {
            runtimeCharacter.looped = true;
        });
    }, [mixer])
    return ( 
        <></>
     );
}

export default Animation;