import { MMDLoader } from "@/app/modules/MMDLoader";
import useGlobalStore from "@/app/stores/useGlobalStore";
import path from "path-browserify";
import { Suspense, useEffect } from "react";

function Character() {
    const { helper, api, character, gui } = useGlobalStore(
        (state) => ({
            helper: state.helper,
            api: state.api,
            character: state.character,
            gui: state.gui
        })
    )

    useEffect(() => {
        if (!api || !helper) {
            return
        }
        (async () => {

            const filename = api.character
            const url = api.pmxFiles.character[filename]
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

            const { mesh, animation } = await (new MMDLoader()).loadWithAnimation(url, api.motionFile, () => { }, null, characterParams)

            helper.add(mesh, {
                animation
            })
            const runtimeCharacter = helper.objects.get(mesh)
            runtimeCharacter.physics.reset();
            helper.enable('physics', api['physics']);

            if (api.character != filename) {
                api.character = filename
                gui.updateMorphFolder()
            }

            useGlobalStore.setState({ character: mesh, runtimeCharacter })
        })()
    }, [api])

    return (
        <Suspense fallback={null}>
            {character ? <primitive object={character} dispose={null} /> : null}
        </Suspense>
    )
}

export default Character;