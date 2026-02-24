import { loadFile } from "@/app/utils/gui";
import onLoad from "./onLoad";

function onCreate() {
    loadFile((data, name) => {
        onLoad(name, data)
    });
}

export default onCreate;