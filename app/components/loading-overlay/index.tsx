import styles from "./styles.module.css"

function LoadingOverlay({ children="" }: { children?: string }) {
    return (
        <div id="overlay" className={styles.overlay}>
            <h1 id="loading">
                Loading {children}...
            </h1>
        </div>
    );
}

export default LoadingOverlay;