import styles from "./styles.module.css"

function FileSelector() {
    return (
        <input id="selectFile" className={styles.selectFile} type="file" />
    );
}

export default FileSelector;