import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { disposeMesh, onProgress } from "@/app/utils/base";
import { useThree } from "@react-three/fiber";
import path from "path-browserify";
import { Suspense, useEffect } from "react";

function Stage() {
    const { scene } = useThree()
    const { loader, stage } = useGlobalStore(
        (state) => ({
            loader: state.loader,
            stage: state.stage
        })
    )
    const api = usePresetStore()


    useEffect(() => {
        if (!api.pmxFiles) return
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
        useGlobalStore.setState({ loadStage })

        return () => {
            scene.remove(stage);
            disposeMesh(stage);
        }
    }, [api.stage, api.pmxFiles])
    return (
        <Suspense fallback={null}>
            {stage ? <primitive object={stage} dispose={null} /> : null}
        </Suspense>
    );
}

export default Stage;