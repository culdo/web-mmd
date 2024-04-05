import useGlobalStore from "@/app/stores/useGlobalStore";
import { onProgress } from "@/app/utils/base";
import path from "path-browserify";
import { Suspense, useEffect } from "react";

function Stage() {
    const { api, loader, stage } = useGlobalStore(
        (state) => ({
            api: state.api,
            loader: state.loader,
            stage: state.stage
        })
    )

    useEffect(() => {
        if (!api) return

        const loadStage = async (url = api.pmxFiles.stage[api.stage], filename = api.stage) => {
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
        }
        loadStage()
    }, [api])
    return (
        <Suspense fallback={null}>
            {stage ? <primitive object={stage} dispose={null} /> : null}
        </Suspense>
    );
}

export default Stage;