import WithSuspense from "../../suspense";
import useAnimation from "./useAnimation";
import usePose from "./usePose";
import usePhysics from "./usePhysics";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { SkinnedMesh } from "three";

const BaseHelper = WithSuspense(({ characterPromise, stagePromise }: { characterPromise: Promise<SkinnedMesh>, stagePromise: Promise<SkinnedMesh> }) => {
    useAnimation(characterPromise)
    usePhysics(characterPromise)
    usePose(characterPromise, stagePromise)
    return <></>
})

function Helper() {
    const characterPromise = useGlobalStore(state => state.characterPromise)
    const stagePromise = useGlobalStore(state => state.stagePromise)
    return <BaseHelper characterPromise={characterPromise} stagePromise={stagePromise}></BaseHelper>;
}

export default WithSuspense(Helper);