import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { disposeMesh, onProgress } from "@/app/utils/base";
import { buildGuiItem, buildLoadModelFn } from "@/app/utils/gui";
import { useThree } from "@react-three/fiber";
import { button, useControls } from "leva";
import path from "path-browserify";
import { useEffect, useState } from "react";
import PromisePrimitive from "../promise-primitive";

function Stage() {
    const { scene } = useThree()

    const stagePromise = useGlobalStore(state => state.stagePromise)
    const stageName = usePresetStore(state => state.stage)
    const pmxFiles = usePresetStore(state => state.pmxFiles)
    const enablePBR = usePresetStore(state => state["enable PBR"])
    const groundShadow = usePresetStore(state => state["ground shadow"])

    const url = pmxFiles.stage[stageName]
    const filename = stageName

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
            selectFile.webkitdirectory = false;
        }),
    }), { collapsed: true, order: 2 }, [pmxFiles.stage])

    useEffect(() => {
        const init = async () => {
            const { loader } = useGlobalStore.getState()

            const stageParams = {
                enablePBR,
            };
            if (url.startsWith("data:")) {
                Object.assign(stageParams, {
                    modelExtension: path.extname(filename).slice(1),
                    modelTextures: pmxFiles.modelTextures.stage[filename],
                })
            }

            const mesh = await loader
                .setModelParams(stageParams)
                .loadAsync(url, onProgress)
            const stage = mesh;
            // stage.castShadow = true;

            useGlobalStore.setState({ stage })
            set({ name: stageName })

            return stage
        }
        useGlobalStore.setState({stagePromise: init()})
        return () => {
            const { stage } = useGlobalStore.getState()
            scene.remove(stage);
            disposeMesh(stage);
        }
    }, [url, filename, enablePBR])


    return (
        <PromisePrimitive promise={stagePromise} receiveShadow={groundShadow}></PromisePrimitive>
    );
}

export default Stage;