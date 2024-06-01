import { MMDLoader } from "@/app/modules/MMDLoader";
import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { onProgress } from "@/app/utils/base";
import path from "path-browserify";
import { Suspense, useEffect } from "react";

function Character() {
    const { helper, character, loader, updateMorphFolder } = useGlobalStore(
        (state) => ({
            helper: state.helper,
            character: state.character,
            loader: state.loader,
            updateMorphFolder: state.updateMorphFolder
        })
    )
    const api = usePresetStore()

    useEffect(() => {
        if (!api || !helper) {
            return
        }
        const loadCharacter = async (url = api.pmxFiles.character[api.character], filename = api.character) => {
            const characterParams = {
                enableSdef: api['enable SDEF'],
                enablePBR: api['enable PBR'],
                followSmooth: api["follow smooth"]
            };
            if (url.startsWith("data:")) {
                Object.assign(characterParams, {
                    modelExtension: path.extname(filename).slice(1),
                    modelTextures: api.pmxFiles.modelTextures.character[filename]
                });
            }

            const mmd = await loader.loadWithAnimation(url, api.motionFile, onProgress, () => { }, characterParams as any);
            const character = mmd.mesh;
            character.castShadow = true;
            character.receiveShadow = api["self shadow"];

            helper.add(character, {
                animation: mmd.animation
            });
            const runtimeCharacter = helper.objects.get(character)

            runtimeCharacter.physics.reset();

            if (api.character != filename) {
                api.character = filename
                updateMorphFolder()
            }
            useGlobalStore.setState({ character, runtimeCharacter })
        }

        loadCharacter()
        useGlobalStore.setState({ loadCharacter })

    }, [api])

    return (
        <Suspense fallback={null}>
            {character ? <primitive object={character} dispose={null} /> : null}
        </Suspense>
    )
}

export default Character;