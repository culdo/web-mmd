import useGlobalStore from "../stores/useGlobalStore";
import usePresetStore, { PresetState } from "../stores/usePresetStore";
import { blobToBase64 } from "./base";

function buildLoadModelFn(itemType: "character" | "stage") {
    
    return async function (event: Event) {
        const pmxFiles = usePresetStore.getState().pmxFiles;
        const modelTextures = pmxFiles.modelTextures
        
        const input = event.target as HTMLInputElement
        if (input.files.length < 1) return;
        let pmxFilesByType: any = pmxFiles[itemType] = {};
        let texFilesByType: any = modelTextures[itemType] = {};

        // load model and textures from unzipped folder
        let firstKey;
        const resourceMap: any = {};
        for (const f of input.files) {
            let relativePath = f.webkitRelativePath;
            const resourcePath = relativePath.split("/").slice(1).join("/").normalize()

            let url = await blobToBase64(f);

            // save model file
            if (f.name.includes(".pmx") || f.name.includes(".pmd")) {
                const modelName = f.name
                texFilesByType[modelName] = resourceMap;

                if (!firstKey) firstKey = modelName
                pmxFilesByType[modelName] = url;
                // save model textures
            } else {
                resourceMap[resourcePath] = url;
            }
        }
        usePresetStore.setState({ pmxFiles });
        
        if(itemType == "character") {
            usePresetStore.setState({ character: firstKey });
        } else if(itemType == "stage") {
            usePresetStore.setState({ stage: firstKey });
        }
    }
}

function buildLoadFileFn(cb: (file: string, name: string) => void) {
    return async function (event: Event) {
        const input = event.target as HTMLInputElement
        if (input.files.length < 1) return;
        cb(await blobToBase64(input.files[0]), input.files[0].name);
    }
}
export { buildLoadModelFn, buildLoadFileFn }