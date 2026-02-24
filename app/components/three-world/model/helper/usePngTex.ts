import useConfigStore from "@/app/stores/useConfigStore";
import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { useTexture } from "@react-three/drei";
import * as THREE from "three"

function usePngTex(model: THREE.SkinnedMesh) {
    const modelConfig = usePresetStore(state => state.models)[model.name]
    const remoteModelConfig = useGlobalStore(state => state.remoteModels)[model.name]
    const modelFilename = (modelConfig ?? remoteModelConfig).fileName
    const modelFoldername = modelFilename.split("/")[0]

    const modelTextures = useConfigStore(state => state.pmxFiles).modelTextures[modelFoldername] ?? {}
    const pngDatas = Object.keys(modelTextures).filter(
        (filename) => filename.includes(".png")).reduce(
            (obj: Record<string, string>, key) => {
                obj[key] = modelTextures[key]
                return obj
            }, {})

    const pngTexs = useTexture(pngDatas)

    const skin = useTexture("https://raw.githubusercontent.com/ray-cast/ray-mmd/master/Materials/_MaterialMap/skin.png");

    const mapOptions = {
        none: null as null,
        skin,
        ...pngTexs
    };

    for (const tex of Object.values(mapOptions)) {
        if (!tex) continue
        tex.flipY = false;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.colorSpace = THREE.SRGBColorSpace
    }

    return mapOptions
}

export default usePngTex;