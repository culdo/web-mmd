import usePresetStore from "@/app/stores/usePresetStore";
import { useTexture } from "@react-three/drei";
import * as THREE from "three"

function usePngTex(model: THREE.SkinnedMesh) {
    const { fileName: modelFilename } = usePresetStore(state => state.models)[model.name]
    const modelFoldername = modelFilename.split("/")[0]

    const modelTextures = usePresetStore(state => state.pmxFiles).modelTextures[modelFoldername] ?? {}
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