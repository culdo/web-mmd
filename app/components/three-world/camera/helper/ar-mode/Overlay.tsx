import styles from "./styles.module.css"

function Overlay() {
    return (
        <div className={styles.overlay}>
            <h1 id="loading" className="text-4xl">
                Waiting for WebRTC connection...
            </h1>
        </div>
    );
}

export default Overlay;