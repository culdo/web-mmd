import useGlobalStore from "@/app/stores/useGlobalStore";
import { Leva } from "leva";
import styles from "./styles.module.css"
import { useEffect, useRef, useState } from "react";
import useAbout from "./useAbout";
import useAutoHide from "../control-bar/audio-player/useAutoHide";

function Panel() {
    const gui = useGlobalStore(state => state.gui)
    const presetReady = useGlobalStore(states => states.storeReady)
    const hidden = !presetReady || gui.hidden
    const [collapsed, setCollapsed] = useState(false)
    
    useAbout()
    useEffect(() => {
        if (window.innerWidth < 1000) {
            setCollapsed(true)
        }
    }, []);
    
    const containerRef = useRef<HTMLDivElement>(null)
    const onPlay = () => {
        containerRef.current.style.opacity = "0.0";
    }
    const onPause = () => {
        containerRef.current.style.opacity = "1.0";
    }
    useAutoHide(onPlay, onPause)

    return (
        <div ref={containerRef} className={styles.levaContainer}>
            <Leva
                oneLineLabels
                {...gui}
                collapsed={{
                    collapsed: collapsed,
                    onChange: (state) => setCollapsed(state)
                }}
                hidden={hidden}>
            </Leva>
        </div>
    );
}

export default Panel;