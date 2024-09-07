import useGlobalStore from "@/app/stores/useGlobalStore";
import { use } from "react";

function useCharacter() {
    const characterPromise = useGlobalStore(state => state.characterPromise)
    return use(characterPromise)
}

export default useCharacter;