import styles from "./styles.module.css"

function LoadingOverlay({ content = "" }) {
    return (
        <div id="overlay" className={styles.overlay}>
            <h1 id="loading">
                {content}
            </h1>
        </div>
    );
}

export default LoadingOverlay;