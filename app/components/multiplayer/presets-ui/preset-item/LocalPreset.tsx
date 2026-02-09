import useGlobalStore from "@/app/stores/useGlobalStore";
import { MouseEvent, useEffect, useState } from "react";
import PresetCard from "./PresetCard";
import useConfigStore from "@/app/stores/useConfigStore";

function LocalPreset() {
    const getScreenShot = useGlobalStore(state => state.getScreenShot)
    const preset = useConfigStore(state => state.preset)
    const [screenShot, setScreenShot] = useState<string>()

    useEffect(() => {
        const screenshot = getScreenShot()
        setScreenShot(screenshot)
    }, [getScreenShot])

    const inPreview = (e: MouseEvent) => {
        const screenshot = getScreenShot()
        setScreenShot(screenshot)
    }

    const outPreview = (e: MouseEvent) => {
    }
    const onClick = (e: MouseEvent) => {
    }

    return (
        <PresetCard
            presetName={preset}
            previewImgSrc={screenShot}
            inPreview={inPreview}
            outPreview={outPreview}
            onClick={onClick}
        >
        </PresetCard>
    );
}

export default LocalPreset;