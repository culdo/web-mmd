import { loadFile } from "@/app/utils/gui";
import onLoad from "./onLoad";

function onCreate() {
    loadFile((cameraFile, camera) => {
        onLoad(camera, cameraFile)
    });
}

export default onCreate;