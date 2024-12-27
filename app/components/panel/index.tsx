import useGlobalStore from "@/app/stores/useGlobalStore";
import { Leva } from "leva";
import usePreset from "./preset";
import styles from "./styles.module.css"
import { useEffect, useState } from "react";

function Panel() {
    const gui = useGlobalStore(state => state.gui)
    usePreset()
    const presetReady = useGlobalStore(states => states.presetReady)
    const hidden = !presetReady || gui.hidden
    const [collapsed, setCollapsed] = useState(false)

    function handleWindowSizeChange() {
        if (window.innerWidth < 1000) {
            setCollapsed(true)
        }
    }
    useEffect(() => {
        window.addEventListener('resize', handleWindowSizeChange);
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange);
        }
    }, []);

    return (
        <div className={styles.levaContainer}>
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