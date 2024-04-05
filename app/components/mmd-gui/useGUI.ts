import { MMDGui } from "@/app/modules/gui";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { useEffect } from "react";

function useGUI() {
    const globalState = useGlobalStore()
    const { api, runtimeCharacter, loadCamera, gui } = globalState
    useEffect(() => {
        const gui = new MMDGui()
        useGlobalStore.setState({ gui })
    }, [])
}

export default useGUI;