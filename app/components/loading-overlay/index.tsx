import useGlobalStore from "@/app/stores/useGlobalStore";
import styles from "./styles.module.css"

function LoadingOverlay({ children = "" }: { children?: string }) {
    const presetReady = useGlobalStore(states => states.presetReady)
    if (presetReady) return <></>
    return (
        <div className={styles.overlay}>
            <h1>
                Loading {children}...
            </h1>
        </div>
    );
}

export default LoadingOverlay;