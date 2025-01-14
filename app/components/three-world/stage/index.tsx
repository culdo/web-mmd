import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { onProgress } from "@/app/utils/base";
import { buildGuiItem, buildLoadModelFn } from "@/app/utils/gui";
import { useThree } from "@react-three/fiber";
import { button, useControls } from "leva";
import path from "path-browserify";
import { useEffect, useState } from "react";
import usePresetReady from "@/app/stores/usePresetReady";
import WithSuspense from "../../suspense";
import PmxModel from "../pmx-model";
import { MMDLoader } from "@/app/modules/MMDLoader";
import * as THREE from 'three';

function Stage() {
    const { scene } = useThree()

    usePresetReady()
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
    }), { collapsed: true, order: 2 }, [url])

    const [onCreate, setOnCreate] = useState<(mesh: THREE.SkinnedMesh) => void>()
    const [props, setProps] = useState<Awaited<ReturnType<MMDLoader["loadAsync"]>>>()
    useEffect(() => {
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

        useGlobalStore.setState({
            stagePromise: new Promise(res => setOnCreate(() => res))
        })
        const init = async () => {
            const props = await loader
                .setModelParams(stageParams)
                .loadAsync(url, onProgress);
            setProps(props)
        }
        init()
    }, [url, filename, enablePBR])

    return (
        <PmxModel
            {...props}
            receiveShadow={groundShadow}
            onCreate={onCreate}
        />
    );
}

export default WithSuspense(Stage);