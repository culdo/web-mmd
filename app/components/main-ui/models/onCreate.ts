import _ from "lodash";
import { nanoid } from "nanoid";
import useConfigStore from "@/app/stores/useConfigStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { readFile } from "@/app/utils/base";

function onCreate(add = false) {
    const selectFile = document.getElementById("selectFile") as HTMLInputElement
    selectFile.webkitdirectory = true;
    selectFile.onchange = async function (event: Event) {
        const { pmxFiles } = useConfigStore.getState();
        const { targetModelId } = usePresetStore.getState();
        const modelTextures = pmxFiles.modelTextures

        const input = event.target as HTMLInputElement
        if (input.files.length < 1) return;

        // load model and textures from unzipped folder
        let firstId: string;
        let firstModelname: string;

        for (const f of input.files) {
            const base64data = await readFile(f);

            // save model file
            if (f.name.includes(".pmx") || f.name.includes(".pmd")) {
                const modelName = f.webkitRelativePath
                if (!firstId) {
                    firstId = `${f.name.split(".")[0]}-${nanoid(5)}`
                    firstModelname = modelName
                }
                pmxFiles.models[modelName] = base64data;

                // save model textures
            } else if (f.type.startsWith("image/")) {
                const pathArr = f.webkitRelativePath.split("/")
                const folderName = pathArr[0]
                const resourcePath = pathArr.slice(1).join("/").normalize()
                if (!modelTextures[folderName]) {
                    modelTextures[folderName] = {}
                }
                modelTextures[folderName][resourcePath] = base64data;
            }
        }
        useConfigStore.setState({ pmxFiles: { ...pmxFiles } });

        if (add) {
            usePresetStore.setState({ targetModelId: firstId })
        }

        usePresetStore.setState(({ models }) => {
            const newModels = { ...models }
            if (add) {
                newModels[firstId] = {
                    fileName: firstModelname,
                    motionNames: [],
                    enableMaterial: true,
                    enableMorph: true,
                    enablePhysics: true
                }
            } else {
                newModels[targetModelId].fileName = firstModelname
            }
            return { models: newModels }
        })

        // clear
        input.webkitdirectory = false
    }
    selectFile.click();
}

export default onCreate;