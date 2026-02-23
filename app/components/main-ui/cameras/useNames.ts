import usePresetStore from "@/app/stores/usePresetStore";


function useNames() {
    const cameraName = usePresetStore(state => state.camera)
    return [cameraName]
}
export default useNames;