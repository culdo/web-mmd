import styles from "./styles.module.css"

function AudioPlayer() {
    return (
        <audio
            id="rawPlayer"
            className={`video-js vjs-default-skin ${styles.player}`}
            controls
        >
        </audio>
    );
}

export default AudioPlayer;