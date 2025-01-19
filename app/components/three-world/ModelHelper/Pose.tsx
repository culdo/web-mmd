import useGlobalStore from "@/app/stores/useGlobalStore";
import { buildLoadFileFn } from "@/app/utils/gui";
import { button, useControls } from "leva";
import { useModel } from "./ModelContext";

function Pose() {
    const bindParentCb = useGlobalStore(state => state.bindParentCb)
    const model = useModel()
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
                model.visible = state
            }
        },
        "select pose file": button(() => {
            const selectFile = document.getElementById("selectFile") as HTMLInputElement
            selectFile.onchange = buildLoadFileFn(async (url) => {
                const vpd = await loader.loadVPD(url, false)
                helper.pose(model, vpd)
                if (bindParentCb) {
                    bindParentCb()
                }
            })
            selectFile.click();
            selectFile.webkitdirectory = false;
        }),
    }), { collapsed: true }, [bindParentCb])
    return <></>
}

export default Pose;