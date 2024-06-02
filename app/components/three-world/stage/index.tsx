import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { disposeMesh, onProgress } from "@/app/utils/base";
import { useThree } from "@react-three/fiber";
import path from "path-browserify";
import { Suspense, useCallback, useEffect } from "react";

function Stage() {
    const { scene } = useThree()
    const { loader, stage } = useGlobalStore(
        (state) => ({
            loader: state.loader,
            stage: state.stage
        })
    )
    const api = usePresetStore()

    const url = api.pmxFiles.stage[api.stage]
    const filename = api.stage

    const loadStage = useCallback(async () => {
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
    }, [url, filename])

    const disposeStage = useCallback(() => {
        const stage = useGlobalStore.getState().stage
        scene.remove(stage);
        disposeMesh(stage);
    }, [])
    
    useEffect(() => {
        loadStage()
        return disposeStage
    }, [])
    return (
        <Suspense fallback={null}>
            {stage ? <primitive object={stage} dispose={null} /> : null}
        </Suspense>
    );
}

export default Stage;