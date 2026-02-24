import usePresetStore, {  } from "@/app/stores/usePresetStore";

function onLoad(name: string, data: string) {
    usePresetStore.setState(({ motionFiles }) => {
            return { motionFiles: { ...motionFiles, [name]: data } }
        })
}

export default onLoad;