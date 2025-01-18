import useGlobalStore from "@/app/stores/useGlobalStore";
import { buildLoadFileFn } from "@/app/utils/gui";
import { button, useControls } from "leva";
import { use } from "react";
import WithSuspense from "../../suspense";

function usePose() {

    const characterPromise = useGlobalStore(state => state.characterPromise)
    const stagePromise = useGlobalStore(state => state.stagePromise)
    const bindParentCb = useGlobalStore(state => state.bindParentCb)
    const character = use(characterPromise)
    const stage = use(stagePromise)
    const helper = useGlobalStore(state => state.helper)
    const loader = useGlobalStore(state => state.loader)

    const [_, set] = useControls('Character.Pose', () => ({
        "enabled": {
            value: false,
            onChange: (state) => {
                helper.enable("animation", !state)
            }
        },
        "visible": {
            value: true,
            onChange: (state) => {
                character.visible = state
            }
        },
        "stage visible": {
            value: true,
            onChange: (state) => {
                stage.visible = state
            }
        },
        "select pose file": button(() => {
            const selectFile = document.getElementById("selectFile") as HTMLInputElement
            selectFile.onchange = buildLoadFileFn(async (url) => {
                const vpd = await loader.loadVPD(url, false)
                helper.pose(character, vpd)
                if (bindParentCb) {
                    bindParentCb()
                }
            })
            selectFile.click();
            selectFile.webkitdirectory = false;
        }),
    }), { collapsed: true }, [bindParentCb])
}

export default usePose;