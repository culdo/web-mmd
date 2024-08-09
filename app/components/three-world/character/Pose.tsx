import useGlobalStore from "@/app/stores/useGlobalStore";
import { buildLoadFileFn } from "@/app/utils/gui";
import { button, useControls } from "leva";
import { use } from "react";
import WithSuspense from "../../suspense";

function Pose() {
    
    const characterPromise = useGlobalStore(state => state.characterPromise)
    const bindParentCb = useGlobalStore(state => state.bindParentCb)
    const character = use(characterPromise)
    const helper = useGlobalStore(state => state.helper)
    const loader = useGlobalStore(state => state.loader)

    const [_, set] = useControls('Character.Pose', () => ({
        "enabled": {
            value: false,
            onChange: (state) => {
                helper.enable("animation", !state)
            }
        },
        "select character folder": button(() => {
            const selectFile = document.getElementById("selectFile") as HTMLInputElement
            selectFile.onchange = buildLoadFileFn(async (url) => {
                const vpd = await loader.loadVPD(url, false)
                helper.pose(character, vpd)
                if(bindParentCb) {
                    bindParentCb()
                }
            })
            selectFile.click();
            selectFile.webkitdirectory = false;
        }),
    }), [bindParentCb])
    return (

        <></>
    );
}

export default WithSuspense(Pose);