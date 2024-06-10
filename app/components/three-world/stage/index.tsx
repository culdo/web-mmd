import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { disposeMesh, onProgress } from "@/app/utils/base";
import { useThree } from "@react-three/fiber";
import path from "path-browserify";
import { Suspense, useCallback, useMemo } from "react";
import PromisePrimitive from "../promise-primitive";

function Stage() {
    const { scene } = useThree()

    const api = usePresetStore()

    const url = api.pmxFiles.stage[api.stage]
    const filename = api.stage

    const promise = useMemo(async () => {
        const { loader } = useGlobalStore.getState()
        
        const stageParams = {
            enablePBR: api['enable PBR'],
        };
        if (url.startsWith("data:")) {
            Object.assign(stageParams, {
                modelExtension: path.extname(filename).slice(1),
                modelTextures: api.pmxFiles.modelTextures.stage[filename],
            })
        }

        const mesh = await loader
            .setModelParams(stageParams)
            .loadAsync(url, onProgress)
        const stage = mesh;
        stage.castShadow = true;
        stage.receiveShadow = api['ground shadow'];

        if (api.stage != filename) {
            api.stage = filename
        }
        useGlobalStore.setState({ stage })
        return stage
    }, [url, filename])

    const disposeStage = useCallback(() => {
        const { stage } = useGlobalStore.getState()
        scene.remove(stage);
        disposeMesh(stage);
    }, [])

    return (
        <Suspense fallback={null}>
            <PromisePrimitive promise={promise} dispose={disposeStage}></PromisePrimitive>
        </Suspense>
    );
}

export default Stage;