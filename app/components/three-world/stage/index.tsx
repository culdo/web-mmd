import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { buildGuiItem, buildLoadModelFn } from "@/app/utils/gui";
import { button, useControls } from "leva";
import PmxModel from "../pmx-model";
import * as THREE from 'three';
import WithReady from "@/app/stores/WithReady";

function Stage() {
    const stageName = usePresetStore(state => state.stage)
    const pmxFiles = usePresetStore(state => state.pmxFiles)
    const enablePBR = usePresetStore(state => state["enable PBR"])
    const groundShadow = usePresetStore(state => state["ground shadow"])

    const url = pmxFiles.stage[stageName]

    const [_, set] = useControls('Stage', () => ({
        name: {
            value: stageName,
            options: Object.keys(pmxFiles.stage),
            onChange: (value, path, options) => {
                if (!options.initial) {
                    usePresetStore.setState({ stage: value })
                }
            }
        },
        "ground shadow": buildGuiItem("ground shadow"),
        "select stage folder": button(() => {
            const selectFile = document.getElementById("selectFile") as HTMLInputElement
            selectFile.webkitdirectory = true;
            selectFile.onchange = buildLoadModelFn("stage")
            selectFile.click();
        }),
    }), { collapsed: true, order: 202 }, [url])

    return (
        <PmxModel
            url={url}
            modelTextures={pmxFiles.modelTextures.stage[stageName]}
            enableSdef={false}
            enablePBR={enablePBR}
            receiveShadow={groundShadow}
            onCreate={(stage: THREE.SkinnedMesh) => useGlobalStore.setState({
                stage
            })}
        />
    );
}

export default WithReady(Stage);