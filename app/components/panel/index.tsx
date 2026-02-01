import useGlobalStore from "@/app/stores/useGlobalStore";
import { Leva } from "leva";
import usePreset from "./usePreset";
import styles from "./styles.module.css"
import { useEffect, useState } from "react";
import useAbout from "./useAbout";

function Panel() {
    const gui = useGlobalStore(state => state.gui)
    const presetReady = useGlobalStore(states => states.presetReady)
    const hidden = !presetReady || gui.hidden
    const [collapsed, setCollapsed] = useState(false)
    
    usePreset()
    useAbout()
    useEffect(() => {
        if (window.innerWidth < 1000) {
            setCollapsed(true)
        }
    }, []);

    return (
        <div id="leva-container" className={styles.levaContainer}>
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