import styles from "./styles.module.css"

function FileSelector() {
    const onClick = (e: React.MouseEvent<HTMLInputElement>) => {
        (e.target as HTMLInputElement).value = null;
    };
    return (
        <input onClick={onClick} id="selectFile" className={styles.selectFile} type="file" />
    );
}

export default FileSelector;