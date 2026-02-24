import useConfigStore from "@/app/stores/useConfigStore";

function useNames() {
    const cameraFiles = useConfigStore(state => state.cameraFiles)
    return Object.keys(cameraFiles)
}
export default useNames;